import {
	useEffect, useCallback, useState, useRef, useMemo,
} from "react";
import { useCallWrapper } from "../utils";
import Guacamole from "./allFresh";
import guacdPublicStatusErrors from "./GuacdPublicStatusErrors";
import guacdInternalStatuses from "./GuacdInternalStatuses";

export default function GuacamoleConsole({ serverData, userData }) {
	const nonvisibleButtonRef = useRef(null);
	const [errorGuacamoleTunnel, setErrorGuacamoleTunnel] = useState(null);
	const [errorGuacamoleClient, setErrorGuacamoleClient] = useState(null);

	const guacdPublicErrors = useMemo(() => guacdPublicStatusErrors(), []);
	const guacdInternalErrors = useMemo(() => guacdInternalStatuses(), []);

	const [guacClientObj, setGuacClientObj] = useState(null);
	const debug = false;
	const devRef = useRef(null);
	const wrapperRef = useRef(null);

	const _translateErrorMessage = useCallback((strGuacdCode, strGuacoMessage) => {
		if (!strGuacoMessage || strGuacoMessage.indexOf("Aborted") !== -1)
		{
			for (const guacdError in guacdPublicErrors)
			{
				if (guacdPublicErrors[guacdError].code === strGuacdCode)
				{
					return guacdPublicErrors[guacdError].message;
				}
			}

			for (const guacdStatus in guacdInternalErrors)
			{
				if (guacdInternalErrors[guacdStatus].code === strGuacdCode)
				{
					if (userData.user_access_level !== "user")
					{
						return guacdInternalErrors[guacdStatus].message;
					}

					return "REMOTE_CONSOLE_CONNECTION_CLOSED";
				}
			}
		}

		console.log(`Code: ${strGuacdCode}. Message: ${strGuacoMessage}. For more info check https://guacamole.apache.org/doc/gug/protocol-reference.html#status-codes`);

		return "GUACAMOLE_CONSOLE_CONNECTION_ERROR";
	}, [guacdInternalErrors, guacdPublicErrors, userData.user_access_level]);

	const _remoteConsoleParamsConnectionGet = useCallback((productId, datacenterName) => {
		const strProtocol = "vnc";
		const strProductType = "instance";
		const nProductID = productId;
		const usePrivateBSICredentials = false;
		// Include the datacenter in the parameters, but it may not get transmitted with the first chunk
		const strDatacenter = datacenterName;
		const strUserID = userData.user_id;
		const nScreenWidth = Math.floor(window.innerWidth - 2 * wrapperRef.current.offsetLeft);
		const nScreenHeight = Math.floor(window.innerHeight - wrapperRef.current.offsetTop / 2);

		const strProductTypeParam = `strProductType=${strProductType}`;
		const strTest = `strTest=TEST!!!`;
		const strProductIDParam = `&nProductID=${nProductID}`;
		const strDatacenterParam = `&strDatacenter=${strDatacenter}`;
		const strProtocolParam = `&strProtocol=${strProtocol}`;
		const strWindowWidthParam = `&strWindowWidth=${nScreenWidth}`;
		const strWindowHeightParam = `&strWindowHeight=${nScreenHeight}`;
		const strUserIDParam = `&userID=${strUserID}`;
		const usePrivateBSICredentialsParam = `&usePrivateBSICredentials=${usePrivateBSICredentials}`;

		return strProductTypeParam + strProductIDParam + strDatacenterParam + strProtocolParam + strWindowHeightParam + strWindowWidthParam
		    + strUserIDParam + usePrivateBSICredentialsParam + strTest;
	}, [userData.user_id]);

	const configureConsole = useCallback(async () => {
		const instanceId = serverData["instance_id"];
		if (!instanceId) {
			throw new Error(`Server with id #${serverData["server_id"]} doesn't have an instance id`);
		}

		if (instanceId && devRef.current) {
			const tunnelPathUrl = "https://guacamole-test.metalsoft.dev/remote-console/instance-tunnel";

			const guacTunnel = new Guacamole.HTTPTunnel(tunnelPathUrl, true);

			// Just some very big value for not closing session
			const ONE_DAY_MILLISECONDS = 86400000;
			// Set timeout for data receiving
			guacTunnel.receiveTimeout = ONE_DAY_MILLISECONDS;

			guacTunnel.onerror = function (status)
			{
				console.log("guacTunnel error", status);
				const strMessage = _translateErrorMessage(status.code, status.message);
				if (strMessage)
				{
					setErrorGuacamoleTunnel(strMessage);
					console.error(strMessage);
				}
			};

			const guacClient = new Guacamole.Client(guacTunnel);
			const guacDisplay = guacClient.getDisplay();

			setGuacClientObj(guacClient);
			// Add client to display div
			while (devRef.current.firstChild)
			{
				devRef.current.removeChild(devRef.current.firstChild);
			}

			devRef.current.appendChild(guacDisplay.getElement());

			guacClient.onerror = function (status)
			{
				console.log("guacClient error", status);
				const strMessage = _translateErrorMessage(status.code, status.message);
				if (strMessage)
				{
					setErrorGuacamoleClient(strMessage);
					console.error(strMessage);
				}
			};

			// Keyboard
			const keyboard = new Guacamole.Keyboard(document);

			keyboard.onkeydown = function (keysym) {
				guacClient.sendKeyEvent(1, keysym);
			};

			keyboard.onkeyup = function (keysym) {
				guacClient.sendKeyEvent(0, keysym);
			};

			let bTunnelClosed = false;
			let bClientConnected = false;
			let bWasConnected = false;

			guacTunnel.onstatechange = function (state) {
				if (debug) {
					console.log("----------------");
					console.log(`Tunnel state --- ${state}`);
				}

				switch (state)
				{
					case Guacamole.Tunnel.State.CLOSED:
						keyboard.onkeyup = undefined;
						keyboard.onkeydown = undefined;

						bTunnelClosed = true;
						if (debug) {
							console.log(`bClientConnected --- ${bClientConnected}`);
							console.log(`bTunnelClosed --- ${bTunnelClosed}`);
						}

						if (bClientConnected)
						{
							if (bWasConnected)
							{
								console.log("REMOTE_CONSOLE_CONNECTION_CLOSED");
							}
						}
						break;

					case Guacamole.Tunnel.State.OPEN:
						if (debug) {
							console.log("Tunnel.State.OPEN");
						}
						bWasConnected = true;
						break;
					case Guacamole.Tunnel.State.CONNECTING:
						if (debug) {
							console.log("Tunnel.State.CONNECTING");
						}
						break;
					case Guacamole.Tunnel.State.UNSTABLE:
						if (debug) {
							console.log("Tunnel.State.UNSTABLE");
						}
						break;
					default:
						break;
				}
			};

			const ClientState = {
				STATE_IDLE: 0,
				STATE_CONNECTING: 1,
				STATE_WAITING: 2,
				STATE_CONNECTED: 3,
				STATE_DISCONNECTING: 4,
				STATE_DISCONNECTED: 5,
			};

			guacClient.onstatechange = function (state)
			{
				console.log("----------------");
				console.log(`Client state --- ${state}`);

				if (state === ClientState.STATE_IDLE) {
					console.log("ClientState.STATE_IDLE");
				}

				if (state === ClientState.STATE_CONNECTING) {
					console.log("ClientState.STATE_CONNECTING");
				}

				if (state === ClientState.STATE_WAITING) {
					console.log("ClientState.STATE_WAITING");
				}

				if (state === ClientState.STATE_CONNECTED)
				{
					bClientConnected = true;
					console.log("Client connected");
				}
				else
				{
					bClientConnected = false;
				}

				console.log(`bClientConnected --- ${bClientConnected}`);
				console.log(`bTunnelClosed --- ${bTunnelClosed}`);

				if (state === ClientState.STATE_DISCONNECTED)
				{
					if (bTunnelClosed)
					{
						if (bWasConnected)
						{
							// BSI_Guacamole._displayMessage("display", "error", Texts.REMOTE_CONSOLE_LOST_CONNECTION_ERROR);
							console.log("REMOTE_CONSOLE_LOST_CONNECTION_ERROR");
						}
					}
				}
			};

			guacClient.connect(_remoteConsoleParamsConnectionGet(instanceId, serverData["datacenter_name"]));

			if (guacClient.status) {
				console.log("Guacamole Client Status", guacClient.status);
			}

			if (guacTunnel.status) {
				console.log("Guacamole Tunnel Status", guacTunnel.status);
			}

			// Mouse
			const mouse = new Guacamole.Mouse(guacDisplay.getElement());

			const mouseHandler = function (mouseState) {
				guacClient.sendMouseState(mouseState);
			};
			mouse.onmousedown = mouseHandler;
			mouse.onmouseup = mouseHandler;
			mouse.onmousemove = mouseHandler;
		}
	}, [_remoteConsoleParamsConnectionGet, _translateErrorMessage, debug, serverData]);

	const presetConfigConsolInternal = useCallback(async () => {
		if (!guacClientObj) {
			setErrorGuacamoleTunnel(null);
			setErrorGuacamoleClient(null);
			if (!XMLHttpRequest.prototype.origOpen) {
				XMLHttpRequest.prototype.origOpen = XMLHttpRequest.prototype.open;
				XMLHttpRequest.prototype.open = function () {
					this.origOpen.apply(this, arguments);
					const strDatacenter = serverData["datacenter_name"];
					this.setRequestHeader("a-metalsoft-datacenter", strDatacenter);
				};
			}

			await configureConsole();
		}
	}, [configureConsole, guacClientObj, serverData]);

	const cleanup = useCallback(() => {
		if (guacClientObj) {
			guacClientObj.disconnect();
		}
		for (let i = 1; i < 1000000000; i += 1);
	}, [guacClientObj]);

	const [presetConfigConsol, isLoading, presetConfigConsolError] = useCallWrapper(presetConfigConsolInternal, {
		loadingByDefault: true,
	});

	useEffect(() => {
		presetConfigConsol();

		return () => cleanup();
	}, [cleanup, guacClientObj, presetConfigConsol]);

	useEffect(() => {
		nonvisibleButtonRef.current.click();
	}, []);

	useEffect(() => {
		window.addEventListener("beforeunload", cleanup);
		return () => {
			window.removeEventListener("beforeunload", cleanup);
		};
	}, [cleanup]);

	return (
		<div ref={wrapperRef}
			style={{
				width: "100%",
			}}
		>
			<button
				style={{
					position: "absolute",
					visibility: "hidden",
				}}
				ref={nonvisibleButtonRef}
			/>
			<div
				style={{
					padding: "0rem 2rem",
					background: "#1E1E1E",
					color: "white",
				}}
			>
				{errorGuacamoleTunnel || errorGuacamoleClient || presetConfigConsolError}
				{(errorGuacamoleTunnel || errorGuacamoleClient || presetConfigConsolError) && <button style={{ marginLeft: "1rem" }} onClick={() => setGuacClientObj(null)} disabled={isLoading}>Retry</button>}
				{isLoading && <div>Loading...</div>}
			</div>
			<div
				style={{
					position: "relative",
					zIndex: 1,
					background: "black",
				}}
				ref={devRef}
			/>
		</div>
	);
}

import { useMemo, useState } from "react";

async function callOptional(mxFunction, value)
{
	if (typeof mxFunction === "function") {
		return mxFunction(value);
	}

	return value;
}

export function useCallWrapper(onSubmitInternal, {
	/* This flag can set the loading state to true from the beginning */
	loadingByDefault = false,

	// The callback will run after the main call.
	callback: callbackProp = null,

	// A notification will be displayed if the call fails.
	useNotifications = false,

	/* This error message will be used instead of the API/sintax error messsage.
	It will also be used in the notifications (if enabled) and will disable the error details. */
	failMessage = null,

	throwError = false,
} = {})
{
	const [isLoading, setIsLoading] = useState(loadingByDefault);
	const [callError, setCallError] = useState(null);

	const runnableHandler = useMemo(() => {
		if (onSubmitInternal.name.length) {
			console.log(`Warning: The wrapped function has a name (${onSubmitInternal.name}). Did you forget to wrap the initial function with 'useCallback' ?`);
		}

		const wrappedCall = async (...rest) => {
			try {
				setIsLoading(true);
				setCallError(null);

				let results = await onSubmitInternal(...rest);

				// If a callback function is provided, it will be called using the resuls as input.
				results = await callOptional(callbackProp, results);

				return results;
			}
			catch (error) {
				console.error(error);
				setCallError(failMessage !== null ? failMessage : error);

				if (useNotifications) 	{
					const errorMessage = failMessage || "Problem detected.";
					// const errorDetails = getErrorMessage(error).substring(0, 400);

					// dispatchNotification({
					// 	type: "systemRed",
					// 	message: errorMessage,
					// 	details: errorDetails,
					// });
				}

				if (throwError) {
					throw error;
				}
			}
			finally {
				setIsLoading(false);
			}

			return null;
		};

		return wrappedCall;
	}, [callbackProp, failMessage, onSubmitInternal, throwError, useNotifications]);


	return [
		runnableHandler,
		isLoading,
		callError,
	];
}

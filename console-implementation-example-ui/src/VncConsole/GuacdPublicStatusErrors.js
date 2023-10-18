const getErrorStatuses = () => {
	return {
		UNSUPPORTED: { code: 256, message: "UNSUPPORTED" },
		CLIENT_UNAUTHORIZED: { code: 769, message: "CLIENT_UNAUTHORIZED" },
		CLIENT_TIMEOUT: { code: 776, message: "CLIENT_TIMEOUT" },
		CLIENT_OVERRUN: { code: 781, message: "CLIENT_OVERRUN" },
		CLIENT_TOO_MANY: { code: 797, message: "CLIENT_TOO_MANY" },
		RESOURCE_NOT_FOUND: { code: 516, message: "RESOURCE_NOT_FOUND" },
	};
};

export default getErrorStatuses;
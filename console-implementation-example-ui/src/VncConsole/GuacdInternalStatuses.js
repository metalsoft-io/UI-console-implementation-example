const getInternalStatuses = () => {
	return {
		SERVER_ERROR: { code: 512, message: "SERVER_ERROR" },
		SERVER_BUSY: { code: 513, message: "SERVER_BUSY" },
		UPSTREAM_TIMEOUT: { code: 514, message: "UPSTREAM_TIMEOUT" },
		UPSTREAM_ERROR: { code: 515, message: "UPSTREAM_ERROR" },
		RESOURCE_CONFLICT: { code: 517, message: "RESOURCE_CONFLICT" },
		RESOURCE_CLOSED: { code: 518, message: "RESOURCE_CLOSED" },
		CLIENT_BAD_REQUEST: { code: 768, message: "CLIENT_BAD_REQUEST" },
		CLIENT_FORBIDDEN: { code: 771, message: "CLIENT_FORBIDDEN" },
		CLIENT_BAD_TYPE: { code: 783, message: "CLIENT_BAD_TYPE" },
	};
};

export default getInternalStatuses;
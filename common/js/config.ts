var config = {
	LOCAL: {
		apiUrl: "http://localhost:5000",
		appUrl: "http://localhost:4200",
		production: false,
	},
};

var currentEnvironment = config.LOCAL;
export default currentEnvironment;

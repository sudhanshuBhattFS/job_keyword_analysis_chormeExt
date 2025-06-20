var config = {
    LOCAL: {
        apiUrl: "http://localhost:3000",
        appUrl: "http://localhost:4200",
        production: false,
    },
    PROD: {
        apiUrl: "http://31.97.138.164/api",
        appUrl: "http://31.97.138.164",
        production: true,
    },
};

var currentEnvironment = config.LOCAL;
export default currentEnvironment;

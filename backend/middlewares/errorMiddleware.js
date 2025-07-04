class ErrorHandler extends Error {
    constructor(message, statusCode) { // Corrected typo in parameter name
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error"; // Corrected typo in message
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`; // Corrected typo and improved interpolation
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = "Json Web Token is Invalid, Please Try Again!";
        err = new ErrorHandler(message, 400);
    }
    if (err.code === "TokenExpiredError") { // Corrected typo in condition
        const message = "Json Web Token is Expired, Please Try Again!"; // Corrected typo in message
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "CastError") { // Corrected typo in condition
        const message = `Invalid ${err.path}`; // Corrected typo and improved interpolation
        err = new ErrorHandler(message, 400);
    }


    const errorMessage = err.errors
        ? Object.values(err.errors)
            .map((error) => error.message)
            .join(" ")
        : err.message;


    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};

export default ErrorHandler;
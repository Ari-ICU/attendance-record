// utils/apiResponse.js
const ApiResponse = {
    success: (data, message = 'Success', statusCode = 200) => ({
        success: true,
        statusCode,
        message,
        data
    }),
    error: (message = 'Error', statusCode = 400, error = null) => ({
        success: false,
        statusCode,
        message,
        error
    })
};

module.exports = { ApiResponse };

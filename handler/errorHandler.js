const errorHandler = {
	NOT_FOUND: (res, headers) => {
		res.writeHead(404, headers);
		res.write(JSON.stringify({ status: "error", message: "Not Found" }));
		res.end();
	},
	POST: (res, headers) => {
		res.writeHead(404, headers);
		res.write(JSON.stringify({ status: "error", message: "Invalid input" }));
		res.end();
	},
	DELETE: (res, headers) => {
		res.writeHead(404, headers);
		res.write(JSON.stringify({ status: "error", message: "Todo Not Found" }));
		res.end();
	},
};

module.exports = errorHandler;

const successHandler = (res, todos, headers) => {
	res.writeHead(200, headers);
	res.write(JSON.stringify({ status: "success", data: todos }));
	res.end();
};

module.exports = successHandler;

const http = require("http");
const { v4: uuid } = require("uuid");
const errorHandler = require("./errorHandler");
const headers = require("./headers");

let todos = [
	{
		id: uuid(),
		title: "do homework",
		completed: false,
	},
];

const reqListener = (req, res) => {
	//上傳才需使用到 data 事件，其他請求不需要
	let body = "";
	req.on("data", (chunk) => {
		body += chunk.toString();
	});

	if (req.url === "/todos" && req.method === "GET") {
		res.writeHead(200, headers);
		res.write(JSON.stringify({ status: "success", data: todos }));
		res.end();
	} else if (req.url === "/todos" && req.method === "POST") {
		req.on("end", () => {
			try {
				const title = JSON.parse(body).title;
				const completed = JSON.parse(body).completed;

				if (title !== undefined && completed !== undefined) {
					const todo = {
						id: uuid(),
						title: title,
						completed: completed,
					};
					todos.push(todo);
					res.writeHead(200, headers);
					res.write(JSON.stringify({ status: "success", data: todos }));
					res.end();
				} else {
					errorHandler.POST(res, headers);
				}
			} catch (error) {
				//後端工程師定義好錯誤訊息格式，前端工程師就可以根據這個格式來顯示錯誤訊息
				errorHandler.POST(res, headers);
			}
		});
	} else if (req.url === "/todos" && req.method === "DELETE") {
		todos = [];
		res.writeHead(200, headers);
		res.write(JSON.stringify({ status: "success", data: todos }));
		res.end();
	} else if (req.url === "/todos" && req.method === "PATCH") {
		req.on("end", () => {
			try {
				// 檢查 body 陣列中的每個物件都要有 id 屬性
				const updates = JSON.parse(body);
				updates.forEach((updateTodo) => {
					const index = todos.findIndex((todo) => todo.id === updateTodo.id);
					if (index === -1) {
						//有一筆資料id有問題就丟錯誤，前端就不會更新任何資料
						throw new Error("Todo Not Found");
					}
				});

				updates.forEach((updateTodo) => {
					const index = todos.findIndex((todo) => todo.id === updateTodo.id);
					const title = todos[index].title;
					const completed = todos[index].completed;
					if (title !== undefined) {
						todos[index].title = updateTodo.title;
					}
					if (completed !== undefined) {
						todos[index].completed = updateTodo.completed;
					}
				});

				res.writeHead(200, headers);
				res.write(JSON.stringify({ status: "success", data: todos }));
				res.end();
			} catch (error) {
				errorHandler.POST(res, headers);
			}
		});
	} else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
		const urlTodoId = req.url.split("/").pop();
		//刪除特定 todo
		const index = todos.findIndex((todo) => todo.id === urlTodoId);
		// urlTodoId 存在
		if (index !== -1) {
			todos = todos.filter((todo) => todo.id !== urlTodoId);
			res.writeHead(200, headers);
			res.write(JSON.stringify({ status: "success", data: todos }));
			res.end();
		} else {
			errorHandler.DELETE(res, headers);
		}
	} else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
		//先檢查 urlTodoId 是否存在，再檢查 body 的格式是否正確
		const urlTodoId = req.url.split("/").pop();
		const index = todos.findIndex((todo) => todo.id === urlTodoId);

		if (index !== -1) {
			req.on("end", () => {
				try {
					const title = JSON.parse(body).title;
					const completed = JSON.parse(body).completed;

					if (title !== undefined && completed !== undefined) {
						// urlTodoId 存在
						todos[index].title = title;
						todos[index].completed = completed;
						res.writeHead(200, headers);
						res.write(JSON.stringify({ status: "success", data: todos }));
						res.end();
					} else {
						errorHandler.POST(res, headers);
					}
				} catch (error) {
					errorHandler.POST(res, headers);
				}
			});
		} else {
			errorHandler.DELETE(res, headers);
		}
	} else if (req.method === "OPTIONS") {
		res.writeHead(200, headers);
		res.end();
	} else {
		errorHandler.NOT_FOUND(res, headers);
	}
};

const server = http.createServer(reqListener);
server.listen(process.env.PORT || 3000);

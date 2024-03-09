const http = require("http");
const { v4: uuidv4 } = require("uuid");
const todoList = [];
const errorHandle = require("./errorHandle");

const requestListener = (req, res) => {
  //   console.log(req.url);
  //   console.log(req.method);

  let body = "";
  req.on("data", (chunk) => {
    // console.log(chunk);
    body += chunk;
  });

  const header = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  if (req.url == "/todos" && req.method == "GET") {
    res.writeHead(200, header);
    res.write(
      JSON.stringify({
        status: "success",
        data: todoList,
      })
    );
    res.end();
  } else if (req.url == "/todos" && req.method == "POST") {
    req.on("end", () => {
      try {
        // console.log(JSON.parse(body).title);
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const todo = {
            title: title,
            id: uuidv4(),
          };

          todoList.push(todo);
          res.writeHead(200, header);
          res.write(
            JSON.stringify({
              status: "success",
              data: todoList,
            })
          );
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (err) {
        errorHandle(res);
      }
    });
  } else if (req.url == "/todos" && req.method == "DELETE") {
    try {
      //   todoList = []; 不可重複賦值
      todoList.length = 0;
      res.writeHead(200, header);
      res.write(
        JSON.stringify({
          status: "success",
          data: todoList,
        })
      );
      res.end();
    } catch (error) {
      console.log("eee", error);

      errorHandle(res);
    }
  } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
    try {
      //從request路徑取uuid
      const uuid = req.url.split("/").pop();

      const index = todoList.findIndex((element) => element.id == uuid);
      console.log(uuid, index);

      if (index >= 0) {
        todoList.splice(index, 1);

        res.writeHead(200, header);
        res.write(
          JSON.stringify({
            status: "success",
            data: todoList,
          })
        );
        res.end();
      } else {
        errorHandle(res);
      }
    } catch (err) {
      console.log("err DELETE");
      errorHandle(res);
    }
  } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
    req.on("end", () => {
      try {
        //檢查 request body 資料
        //找uuid
        const title = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        if (title == undefined) {
          errorHandle(res);
        }

        const index = todoList.findIndex((element) => element.id == id);
        console.log(index);

        if (index !== -1) {
          //做修改動作

          todoList[index].title = title;
          res.writeHead(200, header);
          res.write(
            JSON.stringify({
              status: "success",
              data: todoList,
            })
          );
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (err) {
        console.log("PATCH err");

        errorHandle(res);
      }
    });
  } else if (req.method == "OPTIONS") {
    res.writeHead(200, header);
    res.end();
  } else {
    res.writeHead(404, header);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此路由",
      })
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(3005);

const https = require("https");

https.get(
  "https://b83xbn594a.execute-api.us-east-1.amazonaws.com/prod/blogs",
  (resp) => {
    let data = "";
    resp.on("data", (chunk) => {
      data += chunk;
    });
    resp.on("end", () => {
      try {
        const blogs = JSON.parse(data);
        console.log("Fetched", blogs.length, "blogs");

        const sorted = blogs.sort((a, b) => {
          const numA = parseInt(a.title?.match(/^(\d+)\./)?.[1]);
          const numB = parseInt(b.title?.match(/^(\d+)\./)?.[1]);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numB - numA;
          }
          return (
            new Date(b.publishDate).getTime() -
            new Date(a.publishDate).getTime()
          );
        });
        console.log("Sort succeeded. Top blog:", sorted[0].title);
      } catch (e) {
        console.error("Crash!", e);
      }
    });
  }
);

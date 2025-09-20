const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  let filePath = '.' + req.url;
  
  // 特殊处理 favicon.ico 请求
  if (req.url === '/favicon.ico') {
    // 检查是否存在 favicon.ico 文件
    if (fs.existsSync('./favicon.ico')) {
      filePath = './favicon.ico';
    } else {
      // 如果没有 favicon.ico 文件，则使用 images/192.png 作为替代
      filePath = './images/192.png';
    }
  }
  
  // 如果请求的是根路径，则返回index.html
  if (filePath === './') {
    filePath = './index.html';
  }
  
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // 文件未找到
        console.log(`404 Not Found: ${filePath}`);
        fs.readFile('./404.html', (err, content404) => {
          if (err) {
            // 如果没有404页面，则返回简单错误信息
            res.writeHead(404, { 
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            });
            res.end('<h1>404 Not Found</h1><p>The page you are looking for could not be found.</p>', 'utf-8');
          } else {
            res.writeHead(404, { 
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'no-cache'
            });
            res.end(content404, 'utf-8');
          }
        });
      } else {
        // 其他服务器错误
        console.log(`500 Server Error: ${error.code} for ${filePath}`);
        res.writeHead(500, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // 成功读取文件
      console.log(`200 OK: ${filePath}`);
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`服务器正在运行在 http://localhost:${PORT}/`);
  console.log('按 Ctrl+C 停止服务器');
});
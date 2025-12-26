import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// 代理 n8n webhook 请求
app.post('/webhook-proxy', async (req, res) => {
  try {
    const webhookUrl = 'https://liu0521.app.n8n.cloud/webhook/014a3e71-b221-460d-8de8-1c5bb4c02dad';
    
    console.log('代理请求到:', webhookUrl);
    console.log('请求数据:', JSON.stringify(req.body, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Proxy Server'
      },
      body: JSON.stringify(req.body)
    });
    
    console.log('Webhook 响应状态:', response.status);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('Webhook 响应内容:', responseText);
      res.status(200).send(responseText);
    } else {
      const errorText = await response.text();
      console.error('Webhook 错误响应:', errorText);
      res.status(response.status).send(errorText);
    }
  } catch (error) {
    console.error('代理服务器错误:', error);
    res.status(500).json({ error: '代理服务器内部错误' });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
});
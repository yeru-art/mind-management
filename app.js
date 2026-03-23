require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;

// 核心 AI 分析函数
async function getAIAnalyze(name, text) {
    if (!ZHIPU_API_KEY) {
        return "【系统提示】线上环境未检测到 API Key，请检查 Render 配置。";
    }
    try {
        console.log(`--- 正在为 [${name}] 发起真正的 AI 请求 ---`);
        const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            model: "glm-4", 
            messages: [
                { role: "system", content: "你是一位资深的职场心理咨询师。请针对员工的表现给出温暖、专业、且具有行动指导意义的建议。请用『心理状态分析』和『管理建议』两个板块回答。" },
                { role: "user", content: `员工姓名：${name}。状态描述：${text}` }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${ZHIPU_API_KEY.trim()}`,
                'Content-Type': 'application/json'
            },
            timeout: 20000
        });
        console.log("✅ [AI 响应成功]");
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ AI 接口异常:", error.message);
        return "【系统提示】AI 引擎当前繁忙，请稍后再试。";
    }
}

app.get('/', (req, res) => res.render('index'));
app.get('/test', (req, res) => res.render('test'));

app.post('/submit-feedback', async (req, res) => {
    const { employeeName, feedback } = req.body;
    const aiAdvice = await getAIAnalyze(employeeName, feedback);
    res.send(`
        <div style="font-family: sans-serif; padding: 40px; background: #f8fafc; min-height: 100vh;">
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 750px; margin: 0 auto;">
                <h2 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">🧠 智能化管理建议报告</h2>
                <div style="white-space: pre-wrap; color: #334155; line-height: 1.8; font-size: 16px; background: #f1f5f9; padding: 25px; border-radius: 12px;">${aiAdvice}</div>
                <div style="text-align: center; margin-top: 30px;"><a href="/" style="color: #3b82f6;">返回主控台</a></div>
            </div>
        </div>
    `);
});

// 处理量化测评
app.post('/submit-test', (req, res) => {
    const { q1, q2, q3 } = req.body;
    const totalScore = Number(q1) + Number(q2) + Number(q3);
    res.send(`<h1>得分：${totalScore}</h1><a href="/">返回</a>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 AI 系统已就绪，端口：${PORT}`);
    console.log(`🔑 Key 状态: ${ZHIPU_API_KEY ? '✅ 已加载' : '❌ 未发现'}`);
});
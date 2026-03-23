require('dotenv').config(); // 
const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// ==========================================
// 1. 安全配置区：从环境变量中提取 Key
// ==========================================
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY; 

// ==========================================
// 2. 核心 AI 逻辑：调用智谱 GLM-4 模型
// ==========================================
async function getAIAnalyze(name, text) {
    // 检查 Key 是否存在，防止程序因配置缺失崩溃
    if (!ZHIPU_API_KEY) {
        console.error("❌ 错误：未发现 API Key。请检查 .env 文件或 Render 环境变量配置。");
        return "【系统提示】AI 配置缺失，请联系管理员。";
    }

    try {
        const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            model: "glm-4", 
            messages: [
                { 
                    role: "system", 
                    content: "你是一位资深的职场心理咨询师和HR专家。请针对员工的表现给出温暖、专业、且具有行动指导意义的建议。请用『心理状态分析』和『管理建议』两个板块回答。" 
                },
                { 
                    role: "user", 
                    content: `员工姓名：${name}。状态描述：${text}` 
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${ZHIPU_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 15000 
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("AI 接口调用出错:", error.message);
        return "【系统提示】AI 分析模块当前繁忙。建议进行一次 1对1 的非正式沟通。";
    }
}

// --- 路由配置 ---

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/test', (req, res) => {
    res.render('test');
});

app.post('/submit-feedback', async (req, res) => {
    const { employeeName, feedback } = req.body;
    console.log(`正在为 ${employeeName} 请求智谱 AI 深度分析...`);
    const aiAdvice = await getAIAnalyze(employeeName, feedback);

    res.send(`
        <div style="font-family: 'PingFang SC', sans-serif; padding: 40px; background: #f0f4f8; min-height: 100vh;">
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 700px; margin: 0 auto;">
                <h2 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 15px;">🧠 GLM-4 智能化管理报告</h2>
                <div style="white-space: pre-wrap; color: #334155; line-height: 1.8; font-size: 16px; margin: 25px 0;">${aiAdvice}</div>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 25px 0;">
                <div style="text-align: center;">
                    <a href="/" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">返回管理主控台</a>
                </div>
            </div>
        </div>
    `);
});

app.post('/submit-test', (req, res) => {
    const { q1, q2, q3 } = req.body;
    const totalScore = Number(q1) + Number(q2) + Number(q3);
    
    let resultLevel, advice, color;
    if (totalScore <= 3) {
        resultLevel = "心理状态：优良";
        advice = "员工当前心理韧性较强，工作平衡感佳。";
        color = "#059669";
    } else if (totalScore <= 6) {
        resultLevel = "心理状态：波动预警";
        advice = "检测到轻微的职业焦虑。建议优化其近期工作优先级。";
        color = "#d97706";
    } else {
        resultLevel = "心理状态：高压风险";
        advice = "系统检测到严重的压力积累。建议 HR 介入专业的心理疏导。";
        color = "#e11d48";
    }

    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #f8fafc; min-height: 100vh;">
            <div style="background: white; display: inline-block; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 500px;">
                <h1 style="color: ${color}; font-size: 48px; margin: 10px 0;">${totalScore} 分</h1>
                <h3>${resultLevel}</h3>
                <p style="color: #475569; line-height: 1.6;">${advice}</p>
                <a href="/" style="color: #3b82f6; text-decoration: none; font-weight: bold;">← 返回首页</a>
            </div>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 Mind-Management 系统已就绪！
    本地访问地址: http://localhost:${PORT}
    AI 密钥状态: ${ZHIPU_API_KEY ? '✅ 已加载' : '❌ 未发现 KEY'}
    `);
});
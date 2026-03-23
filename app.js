require('dotenv').config(); // 1. 必须在最顶部，加载 .env 变量
const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// ==========================================
// 1. 安全配置：从环境变量读取 Key
// ==========================================
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;

// ==========================================
// 2. 增强版 AI 逻辑：带详细报错诊断
// ==========================================
async function getAIAnalyze(name, text) {
    if (!ZHIPU_API_KEY) {
        console.error("❌ [配置错误]: 未在 .env 或环境变量中找到 ZHIPU_API_KEY");
        return "【系统提示】检测到服务器未配置 AI 密钥，请联系管理员检查 .env 文件。";
    }

    try {
        console.log(`--- 正在为 [${name}] 发起 AI 请求 ---`);
        
        const response = await axios.post('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            model: "glm-4", 
            messages: [
                { 
                    role: "system", 
                    content: "你是一位资深的职场心理咨询师。请针对员工的表现给出温暖、专业、且具有行动指导意义的建议。请用『心理状态分析』和『管理建议』两个板块回答。" 
                },
                { 
                    role: "user", 
                    content: `员工姓名：${name}。状态描述：${text}` 
                }
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${ZHIPU_API_KEY.trim()}`, // .trim() 防止多余空格
                'Content-Type': 'application/json'
            },
            timeout: 20000 // 延长到 20 秒，防止网络波动
        });

        console.log("✅ [AI 响应成功]");
        return response.data.choices[0].message.content;

    } catch (error) {
        // --- 核心调试区：把错误细节打印在终端 ---
        console.error("🔴 [AI 接口异常详情]:");
        if (error.response) {
            // 服务器返回了错误码（401, 403, 429 等）
            console.error("状态码:", error.response.status);
            console.error("错误数据:", JSON.stringify(error.response.data));
        } else {
            // 网络断了或超时
            console.error("错误信息:", error.message);
        }
        
        return "【系统分析失败】AI 引擎暂时无法响应。请查看服务器终端日志排查 API Key 或额度问题。";
    }
}

// ==========================================
// 3. 路由设置
// ==========================================

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/test', (req, res) => {
    res.render('test');
});

// 处理 AI 反馈
app.post('/submit-feedback', async (req, res) => {
    const { employeeName, feedback } = req.body;
    const aiAdvice = await getAIAnalyze(employeeName, feedback);

    res.send(`
        <div style="font-family: 'PingFang SC', sans-serif; padding: 40px; background: #f8fafc; min-height: 100vh;">
            <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 750px; margin: 0 auto;">
                <h2 style="color: #1e293b; border-bottom: 3px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">🧠 智能化管理建议报告</h2>
                <div style="white-space: pre-wrap; color: #334155; line-height: 2; font-size: 16px; background: #f1f5f9; padding: 25px; border-radius: 12px;">${aiAdvice}</div>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="/" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 35px; text-decoration: none; border-radius: 8px; font-weight: 600;">返回主控台</a>
                </div>
            </div>
        </div>
    `);
});

// 处理量化测评
app.post('/submit-test', (req, res) => {
    const { q1, q2, q3 } = req.body;
    const totalScore = Number(q1) + Number(q2) + Number(q3);
    
    let resultLevel, advice, color;
    if (totalScore <= 3) {
        resultLevel = "心理状态：优良";
        advice = "当前状态稳定，建议保持当前管理节奏。";
        color = "#059669";
    } else if (totalScore <= 6) {
        resultLevel = "心理状态：轻度波动";
        advice = "检测到潜在压力源，建议进行非正式沟通。";
        color = "#d97706";
    } else {
        resultLevel = "心理状态：高压风险";
        advice = "风险等级较高，建议强制调休或心理干预。";
        color = "#e11d48";
    }

    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #f8fafc; min-height: 100vh;">
            <div style="background: white; display: inline-block; padding: 50px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); max-width: 500px;">
                <h1 style="color: ${color}; font-size: 56px; margin: 0;">${totalScore}</h1>
                <h3 style="color: #1e293b; margin: 20px 0;">${resultLevel}</h3>
                <p style="color: #64748b; line-height: 1.6;">${advice}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <a href="/" style="color: #3b82f6; text-decoration: none; font-weight: bold;">← 返回主控台</a>
            </div>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    --------------------------------------------------
    🚀 Mind-Management 系统启动成功！
    📍 本地访问: http://localhost:${PORT}
    🔑 AI 密钥: ${ZHIPU_API_KEY ? '✅ 已加载' : '❌ 未发现 KEY'}
    --------------------------------------------------
    `);
});
const express = require('express');
const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public')); // 确保能读取静态文件

// --- 路由 1：首页 ---
app.get('/', (req, res) => {
    res.render('index');
});

// --- 路由 2：测评页 ---
app.get('/test', (req, res) => {
    res.render('test');
});

// --- 处理模块 A：AI 心理反馈（模拟） ---
function mockAIAnalyze(name, text) {
    const database = [
        "该员工表现出明显的『职场倦怠』迹象，建议减少重复性工作。",
        "文字中透露出『习得性无助』，建议通过拆解小目标来重建其自信心。",
        "表现出极强的『成就动机』，当前压力处于良性区间。",
        "可能存在『防御性心理』，沟通时应采用启发式提问。"
    ];
    const randomAdvice = database[Math.floor(Math.random() * database.length)];
    return `【心理诊断报告 - ${name}】\n\n分析结果：${randomAdvice}\n\n管理行动指南：建议进行一次非正式谈话。`;
}

app.post('/submit-feedback', (req, res) => {
    const { employeeName, feedback } = req.body;
    const aiAdvice = mockAIAnalyze(employeeName, feedback);
    res.send(`
        <div style="font-family: sans-serif; padding: 40px; background: #f0f4f8; min-height: 100vh;">
            <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">🧠 AI 核心引擎分析结果</h2>
                <p style="white-space: pre-wrap; color: #4a5568; line-height: 1.8;">${aiAdvice}</p>
                <a href="/" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">返回首页</a>
            </div>
        </div>
    `);
});

// --- 处理模块 B：数值测评（修复逻辑） ---
app.post('/submit-test', (req, res) => {
    const { q1, q2, q3 } = req.body;
    
    // 强制转换为数字相加，避免字符串拼接 Bug
    const totalScore = Number(q1) + Number(q2) + Number(q3);
    
    let resultLevel = "";
    let color = "";

    if (totalScore <= 2) {
        resultLevel = "状态良好：心理弹性极佳，当前处于黄金状态。";
        color = "#059669";
    } else if (totalScore <= 5) {
        resultLevel = "轻度预警：近期存在职业焦虑，建议进行正念练习。";
        color = "#d97706";
    } else {
        resultLevel = "高危风险：检测到身心倦怠，建议强制休息。";
        color = "#e11d48";
    }

    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #f8fafc; min-height: 100vh;">
            <div style="background: white; display: inline-block; padding: 40px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 500px;">
                <h1 style="color: ${color}">测评得分：${totalScore}</h1>
                <h3 style="color: #1e293b; margin-top: 20px;">${resultLevel}</h3>
                <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
                <p style="color: #64748b; font-size: 0.9em;">* 数据已实时记入本地心智模型库 *</p>
                <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">返回主控台</a>
            </div>
        </div>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 系统已在端口 ${PORT} 启动...`);
});
const express = require('express');
const app = express();
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// --- 模拟 AI 心理分析逻辑 ---
function mockAIAnalyze(name, text) {
    const database = [
        "该员工表现出明显的『职场倦怠』迹象，建议减少重复性工作，增加正向反馈。",
        "文字中透露出『习得性无助』，建议通过拆解小目标来重建其自信心。",
        "表现出极强的『成就动机』，当前压力处于良性区间，建议给予更多挑战性任务。",
        "情绪波动较大，可能存在『防御性心理』，沟通时应避开直接批评，采用启发式提问。"
    ];
    // 随机抽取一条建议
    const randomAdvice = database[Math.floor(Math.random() * database.length)];
    
    return `【心理诊断报告 - ${name}】\n\n分析结果：${randomAdvice}\n\n管理行动指南：建议在下周与其进行一次 15 分钟的非正式咖啡谈话。`;
}

// 路由
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/submit-feedback', (req, res) => {
    const { employeeName, feedback } = req.body;
    
    console.log(`正在为 ${employeeName} 进行本地心理建模...`);

    // 调用模拟函数，而不是 OpenAI
    const aiAdvice = mockAIAnalyze(employeeName, feedback);

    res.send(`
        <div style="font-family: 'PingFang SC', sans-serif; padding: 40px; background: #f0f4f8; min-height: 100vh;">
            <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">🧠 心理分析报告 (本地预览模式)</h2>
                <p style="white-space: pre-wrap; color: #4a5568; line-height: 1.8; font-size: 16px;">${aiAdvice}</p>
                <hr style="border: 0.5px solid #eee; margin: 20px 0;">
                <a href="/" style="display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">返回录入下一位</a>
            </div>
        </div>
    `);
});

app.listen(3000, () => {
    console.log("🚀 离线开发模式已启动：http://localhost:3000");
});
// ...前面的 express 基础配置保持不变...

// 1. 新增：进入测评页面的路由
app.get('/test', (req, res) => {
    res.render('test');
});

// 2. 新增：处理测评提交
app.post('/submit-test', (req, res) => {
    const { q1, q2, q3 } = req.body;
    
    // 计算总分 (Score calculation)
    const totalScore = parseInt(q1) + parseInt(q2) + parseInt(q3);
    
    let resultLevel = "";
    let advice = "";

    // 简单的信效度分级逻辑
    if (totalScore <= 2) {
        resultLevel = "良好";
        advice = "您的心理弹性较强，睡眠与压力平衡极佳，建议保持当前的作息。";
    } else if (totalScore <= 5) {
        resultLevel = "轻度预警";
        advice = "近期可能存在一定的职业焦虑，建议尝试『正念呼吸法』，并合理划分工作边界。";
    } else {
        resultLevel = "中高度风险";
        advice = "系统检测到明显的睡眠剥夺与身心倦怠，建议强制休息，并寻求专业的 EAP（员工帮助计划）咨询。";
    }

    res.send(`
        <div style="font-family: sans-serif; padding: 40px; text-align: center; background: #f8fafc; height: 100vh;">
            <div style="background: white; display: inline-block; padding: 40px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <h2 style="color: ${totalScore > 5 ? '#e11d48' : '#059669'}">测评得分：${totalScore} (${resultLevel})</h2>
                <p style="max-width: 400px; color: #475569; line-height: 1.8;">${advice}</p>
                <hr>
                <p style="font-size: 0.8em; color: #94a3b8;">*本测评基于 PSQI 简化版，非医疗诊断。*</p>
                <a href="/" style="color: #2563eb; text-decoration: none; font-weight: bold;">返回首页</a>
            </div>
        </div>
    `);
});

// ...app.listen 保持不变...
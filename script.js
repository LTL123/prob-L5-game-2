let balls = [];
let gameResults = {
    even: 0,
    odd: 0,
    total: 0,
    evenEven: 0,
    oddOdd: 0,
    evenOdd: 0
};
let probabilityHistory = [];
let gameCount = 0;
let chart;
let autoPlayInterval = null;
let autoPlayCount = 0;
const TOTAL_AUTO_PLAYS = 100;

// 初始化图表
function initChart() {
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '获胜概率',
                data: [],
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                tension: 0.3,
                fill: true,
                pointBackgroundColor: '#4361ee',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '概率 (%)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '游戏次数',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        callback: function(value) {
                            return value;
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '获胜概率变化趋势',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        bottom: 15
                    }
                },
                legend: {
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: 10,
                    cornerRadius: 6,
                    displayColors: false,
                    callbacks: {
                        title: function(tooltipItem) {
                            return `第 ${tooltipItem[0].label} 次游戏`;
                        },
                        label: function(context) {
                            return `获胜概率: ${context.raw}%`;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        }
    });
}

function updateChart(probability) {
    gameCount++;
    probabilityHistory.push(probability);

    // 更新图表数据
    chart.data.labels.push(gameCount);
    chart.data.datasets[0].data.push(probability);

    // 移除数据点限制，显示所有数据
    chart.update();
}

function generateBalls() {
    const evenCount = parseInt(document.getElementById('evenCount').value) || 0;
    const oddCount = parseInt(document.getElementById('oddCount').value) || 0;

    if (evenCount < 0 || oddCount < 0) {
        alert('请输入非负数！');
        return;
    }

    if (evenCount + oddCount < 2) {
        alert('球的总数至少需要2个！');
        return;
    }
    if (evenCount + oddCount > 5000) {
        alert('球的总数不能大于5000！');
        return;
    }

    balls = [];

    // 生成偶数球
    for (let i = 0; i < evenCount; i++) {
        balls.push(2 * (i + 1));
    }

    // 生成奇数球
    for (let i = 0; i < oddCount; i++) {
        balls.push(2 * i + 1);
    }

    // 隐藏概率对比表格
    document.getElementById('probabilityComparison').style.display = 'none';

    updateBallDisplay();
}

function updateBallDisplay() {
    const container = document.getElementById('ballContainer');
    container.innerHTML = '';

    balls.forEach((number, index) => {
        const ball = document.createElement('div');
        ball.className = `ball ${number % 2 === 0 ? 'even' : 'odd'}`;
        ball.textContent = number;
        container.appendChild(ball);
    });

    updateStats();
}

function updateSpeedValue() {
    const speed = document.getElementById('gameSpeed').value;
    document.getElementById('speedValue').textContent = speed;
}

function getGameSpeed() {
    const speed = parseInt(document.getElementById('gameSpeed').value);
    return 1000 / speed; // 将速度值转换为毫秒间隔
}

function toggleAutoPlay() {
    const button = document.getElementById('autoPlayBtn');

    if (autoPlayInterval) {
        // 停止自动游戏
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        button.textContent = '自动进行100次';
        button.classList.remove('active');
        // 显示概率对比
        showProbabilityComparison();
        // 更新图表显示所有数据点
        updateChartWithAllData();
        return;
    }

    if (balls.length < 2) {
        alert('请先生成球！');
        return;
    }

    // 开始自动游戏
    button.textContent = '停止自动游戏';
    button.classList.add('active');
    autoPlayCount = 0;

    autoPlayInterval = setInterval(() => {
        if (autoPlayCount >= TOTAL_AUTO_PLAYS) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
            button.textContent = '自动进行100次';
            button.classList.remove('active');
            // 显示概率对比
            showProbabilityComparison();
            // 更新图表显示所有数据点
            updateChartWithAllData();
            return;
        }

        playGame();
        autoPlayCount++;
    }, getGameSpeed());
}

function playGame() {
    if (balls.length < 2) {
        alert('至少需要两个球才能开始游戏！');
        return;
    }

    // 使用Fisher-Yates洗牌算法进行随机抽取
    const shuffled = [...balls];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const selected = shuffled.slice(0, 2);
    const sum = selected[0] + selected[1];

    gameResults.total++;

    const isFirstEven = selected[0] % 2 === 0;
    const isSecondEven = selected[1] % 2 === 0;

    if (isFirstEven && isSecondEven) {
        gameResults.evenEven++;
    } else if (!isFirstEven && !isSecondEven) {
        gameResults.oddOdd++;
    } else {
        gameResults.evenOdd++;
    }

    if (sum % 2 === 0) {
        gameResults.even++;
    } else {
        gameResults.odd++;
    }

    // 显示动画
    showDrawAnimation(selected[0], selected[1], sum);

    updateStats();
}

function showDrawAnimation(ball1, ball2, sum) {
    const drawAnimation = document.getElementById('drawAnimation');
    const animBall1 = document.getElementById('animBall1');
    const animBall2 = document.getElementById('animBall2');
    const animResult = document.getElementById('animResult');
    const gameResultDisplay = document.getElementById('gameResultDisplay');

    // 重置动画
    animBall1.style.animation = 'none';
    animBall2.style.animation = 'none';

    // 触发重排
    void animBall1.offsetWidth;
    void animBall2.offsetWidth;

    // 设置球的样式
    animBall1.className = `ball-animation ${ball1 % 2 === 0 ? 'even' : 'odd'}`;
    animBall1.textContent = ball1;

    animBall2.className = `ball-animation ${ball2 % 2 === 0 ? 'even' : 'odd'}`;
    animBall2.textContent = ball2;

    // 设置结果
    animResult.textContent = sum;

    // 显示动画区域
    drawAnimation.style.display = 'flex';

    // 添加动画
    animBall1.style.animation = 'ballEnter 0.8s ease forwards';
    setTimeout(() => {
        animBall2.style.animation = 'ballEnter 0.8s ease forwards';
    }, 200);

    // 显示游戏结果
    gameResultDisplay.style.display = 'block';
    document.getElementById('gameResult').innerHTML =
        `选择了 <strong>${ball1}</strong> 和 <strong>${ball2}</strong>，和为 <strong>${sum}</strong>，结果是 <span style="color:${sum % 2 === 0 ? 'var(--success-color)' : 'var(--accent-color)'}; font-weight:bold">${sum % 2 === 0 ? '偶数 (获胜)' : '奇数 (失败)'}</span>`;
}

function updateStats() {
    const oddCount = balls.filter(n => n % 2 !== 0).length;
    const evenCount = balls.filter(n => n % 2 === 0).length;

    document.getElementById('currentOddCount').textContent = oddCount;
    document.getElementById('currentEvenCount').textContent = evenCount;
    document.getElementById('totalGames').textContent = gameResults.total;

    if (gameResults.total > 0) {
        const winProbability = (gameResults.even / gameResults.total * 100).toFixed(1);
        document.getElementById('winProbability').textContent = `${winProbability}%`;

        // 更新图表
        updateChart(parseFloat(winProbability));

        const evenEvenProbability = (gameResults.evenEven / gameResults.total * 100).toFixed(1);
        const oddOddProbability = (gameResults.oddOdd / gameResults.total * 100).toFixed(1);
        const evenOddProbability = (gameResults.evenOdd / gameResults.total * 100).toFixed(1);

        // 更新实际概率
        document.getElementById('actualEvenEven').textContent = `${evenEvenProbability}%`;
        document.getElementById('actualOddOdd').textContent = `${oddOddProbability}%`;
        document.getElementById('actualEvenOdd').textContent = `${evenOddProbability}%`;
    }
}

// 添加理论概率计算函数
function calculateTheoreticalProbabilities() {
    const oddCount = balls.filter(n => n % 2 !== 0).length;
    const evenCount = balls.filter(n => n % 2 === 0).length;
    const total = balls.length;

    // 计算组合数
    const totalCombinations = (total * (total - 1)) / 2;
    const evenEvenCombinations = (evenCount * (evenCount - 1)) / 2;
    const oddOddCombinations = (oddCount * (oddCount - 1)) / 2;
    const evenOddCombinations = evenCount * oddCount;

    // 计算理论概率
    const evenEvenProb = (evenEvenCombinations / totalCombinations * 100).toFixed(1);
    const oddOddProb = (oddOddCombinations / totalCombinations * 100).toFixed(1);
    const evenOddProb = (evenOddCombinations / totalCombinations * 100).toFixed(1);

    return {
        evenEven: evenEvenProb,
        oddOdd: oddOddProb,
        evenOdd: evenOddProb
    };
}

// 添加显示概率对比的函数
function showProbabilityComparison() {
    if (gameResults.total === 0) return;

    const theoreticalProbs = calculateTheoreticalProbabilities();
    const evenEvenProbability = (gameResults.evenEven / gameResults.total * 100).toFixed(1);
    const oddOddProbability = (gameResults.oddOdd / gameResults.total * 100).toFixed(1);
    const evenOddProbability = (gameResults.evenOdd / gameResults.total * 100).toFixed(1);

    // 更新理论概率
    document.getElementById('theoreticalEvenEven').textContent = `${theoreticalProbs.evenEven}%`;
    document.getElementById('theoreticalOddOdd').textContent = `${theoreticalProbs.oddOdd}%`;
    document.getElementById('theoreticalEvenOdd').textContent = `${theoreticalProbs.evenOdd}%`;

    // 更新实际概率
    document.getElementById('actualEvenEven').textContent = `${evenEvenProbability}%`;
    document.getElementById('actualOddOdd').textContent = `${oddOddProbability}%`;
    document.getElementById('actualEvenOdd').textContent = `${evenOddProbability}%`;

    // 计算并更新差异
    const diffEvenEven = (evenEvenProbability - theoreticalProbs.evenEven).toFixed(1);
    const diffOddOdd = (oddOddProbability - theoreticalProbs.oddOdd).toFixed(1);
    const diffEvenOdd = (evenOddProbability - theoreticalProbs.evenOdd).toFixed(1);

    document.getElementById('diffEvenEven').textContent = `${diffEvenEven}%`;
    document.getElementById('diffOddOdd').textContent = `${diffOddOdd}%`;
    document.getElementById('diffEvenOdd').textContent = `${diffEvenOdd}%`;

    // 为差异添加颜色
    document.getElementById('diffEvenEven').style.color = diffEvenEven > 0 ? 'green' : (diffEvenEven < 0 ? 'red' : 'black');
    document.getElementById('diffOddOdd').style.color = diffOddOdd > 0 ? 'green' : (diffOddOdd < 0 ? 'red' : 'black');
    document.getElementById('diffEvenOdd').style.color = diffEvenOdd > 0 ? 'green' : (diffEvenOdd < 0 ? 'red' : 'black');

    // 显示概率对比表格
    document.getElementById('probabilityComparison').style.display = 'block';
}

function updateChartWithAllData() {
    if (probabilityHistory.length === 0) return;

    // 更新图表配置
    chart.options.scales.x.min = 1;
    chart.options.scales.x.max = probabilityHistory.length;

    // 更新数据
    chart.data.labels = Array.from({
        length: probabilityHistory.length
    }, (_, i) => i + 1);
    chart.data.datasets[0].data = [...probabilityHistory];

    // 优化图表显示
    chart.options.scales.x.ticks = {
        maxTicksLimit: 10,
        callback: function(value) {
            return value;
        }
    };

    chart.update();
}

function resetGame() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        document.getElementById('autoPlayBtn').textContent = '自动进行100次';
        document.getElementById('autoPlayBtn').classList.remove('active');
    }

    balls = [];
    gameResults = {
        even: 0,
        odd: 0,
        total: 0,
        evenEven: 0,
        oddOdd: 0,
        evenOdd: 0
    };
    probabilityHistory = [];
    gameCount = 0;
    document.getElementById('evenCount').value = 0;
    document.getElementById('oddCount').value = 0;
    document.getElementById('gameResultDisplay').style.display = 'none';
    document.getElementById('drawAnimation').style.display = 'none';
    document.getElementById('probabilityComparison').style.display = 'none';
    document.getElementById('totalGames').textContent = '0';
    chart.data.labels = [];
    chart.data.datasets[0].data = [];
    chart.update();
    updateBallDisplay();
}

// 初始化
window.onload = function() {
    initChart();
    document.getElementById('gameSpeed').addEventListener('input', updateSpeedValue);
};
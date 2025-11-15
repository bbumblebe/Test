       // how data will be stored
        let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        let allowance = parseFloat(localStorage.getItem('allowance') || '0');
        let monthStart = new Date(localStorage.getItem('monthStart') || new Date().toISOString());
        
        window.addEventListener('load', () => {
            localStorage.clear();
        });
        // Categories 
        const categoryIcons = {
            'Food': '🍔',
            'Transport': '🚌', 
            'Entertainment': '🎮',
            'Shopping': '🛍️',
            'Books': '📚',
            'Other': '💼',
            'Girlfriend' : '😎',
            'Accomodation' : '🛍️',
            'Light' : '🎯'
        };

        // what makes us set the initial fund
        window.onload = function() {
            if (allowance > 0) {
                showDashboard();
            }
        };

        function setAllowance() {
            const amount = parseFloat(document.getElementById('allowanceInput').value);
            if (amount > 0) {
                allowance = amount;
                monthStart = new Date();
                localStorage.setItem('allowance', allowance);
                localStorage.setItem('monthStart', monthStart.toISOString());
                showDashboard();
            }
        }

        function showDashboard() {
            document.getElementById('welcomeScreen').style.display = 'none';
            document.getElementById('dashboardScreen').style.display = 'grid';
            updateDisplay();
        }

        function quickAdd(category, amount) {
            const expense = {
                id: Date.now(),
                amount: amount,
                category: category,
                note: getCategoryNote(category, amount),
                date: new Date().toISOString()
            };
            
            expenses.push(expense);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateDisplay();
            
            // DEAD CODE
            event.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                event.target.style.transform = 'scale(1)';
            }, 150);
        }
        //Code that gives you categories..... Very important
        function getCategoryNote(category, amount) {
            const notes = {
                'Food': ['NSHIMA', 'Groceries', 'Snacks'],
                'Light' : ['Doritos', 'Noodles', 'Popcorn', 'Viwaya'],
                'Transport': ['Bus', 'Yango', 'Fuel'],
                'Entertainment': ['Netflix and chillin'],
                'Shopping': ['Clothes', 'Accessories', 'Personal items'],
                'Books': ['Textbook', 'Study materials'],
                'Other': ['Emergency', 'Unexpected'],
                'Girlfriend' : ['Hair'],
                'Accomodation' : ['Boarding House']
            };
            return notes[category][Math.floor(Math.random() * notes[category].length)];
        }
        //code that works on the add expense couldve been better but it works...
        function addExpense() {
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const category = document.getElementById('expenseCategory').value;
            const note = document.getElementById('expenseNote').value || getCategoryNote(category, amount);
            
            if (amount > 0) {
                const expense = {
                    id: Date.now(),
                    amount: amount,
                    category: category,
                    note: note,
                    date: new Date().toISOString()
                };
                
                expenses.push(expense);
                localStorage.setItem('expenses', JSON.stringify(expenses));
                
                // Clear form
                document.getElementById('expenseAmount').value = '';
                document.getElementById('expenseNote').value = '';
                
                updateDisplay();
            }
        }

        function deleteExpense(id) {
            expenses = expenses.filter(e => e.id !== id);
            localStorage.setItem('expenses', JSON.stringify(expenses));
            updateDisplay();
        }

        function updateDisplay() {
            // Calculate current month expenses needs debuging ---needs attention hope i remember....
            const now = new Date();
            const monthStartDate = new Date(monthStart);
            const currentMonthExpenses = expenses.filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate >= monthStartDate;
            });
            
            const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
            const remaining = allowance - totalSpent;
            
            // Calculate days
            const daysInMonth = 30;
            const daysPassed = Math.floor((now - monthStartDate) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, daysInMonth - daysPassed);
            const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;
            const avgDaily = daysPassed > 0 ? totalSpent / daysPassed : 0;
            
            // how ill Update the UI
            document.getElementById('balance').textContent = `K${remaining.toFixed(2)}`;
            document.getElementById('daysLeft').textContent = 30;
            document.getElementById('dailyBudget').textContent = `K${dailyBudget.toFixed(2)}`;
            document.getElementById('totalSpent').textContent = `K${totalSpent.toFixed(2)}`;
            document.getElementById('avgDaily').textContent = `K${avgDaily.toFixed(2)}`;
            
            // Update progress bar and status
            const spentPercentage = (totalSpent / allowance) * 100;
            const progressBar = document.getElementById('budgetProgress');
            const progressPercent = document.getElementById('progressPercent');
            const budgetStatus = document.getElementById('budgetStatus');
            
            progressBar.style.width = `${Math.min(100, spentPercentage)}%`;
            progressPercent.textContent = `${spentPercentage.toFixed(0)}%`;
            
            // Update status indicatr
            if (spentPercentage < 70) {
                progressBar.className = 'progress-fill';
                budgetStatus.className = 'status-indicator status-good';
                budgetStatus.innerHTML = '<span>●</span> On Track';
            } else if (spentPercentage < 90) {
                progressBar.className = 'progress-fill warning';
                budgetStatus.className = 'status-indicator status-warning';
                budgetStatus.innerHTML = '<span>●</span> Watch Spending';
            } else {
                progressBar.className = 'progress-fill danger';
                budgetStatus.className = 'status-indicator status-danger';
                budgetStatus.innerHTML = '<span>●</span> Over Budget - Stop Spending';
            }
            
            // expenses list and chart
            displayExpenses(currentMonthExpenses);
            updateSpendingChart(currentMonthExpenses);
        }

        function displayExpenses(expensesList) {
            const container = document.getElementById('expensesList');
            if (expensesList.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div>No expenses yet. Start tracking your spending!</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = expensesList
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 8)
                .map(expense => `
                    <div class="expense-item">
                        <div class="expense-left">
                            <div class="expense-icon category-${expense.category.toLowerCase()}">
                                ${categoryIcons[expense.category]}
                            </div>
                            <div class="expense-info">
                                <h4>${expense.note}</h4>
                                <div class="expense-meta">
                                    ${expense.category} • ${new Date(expense.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="expense-amount">-K${expense.amount.toFixed(2)}</div>
                            <button class="expense-delete" onclick="deleteExpense(${expense.id})">×</button>
                        </div>
                    </div>
                `).join('');
        }

        function updateSpendingChart(expensesList) {
            if (expensesList.length === 0) return;
            
            // Group by category also the bar graph
            const categoryTotals = {};
            expensesList.forEach(e => {
                categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
            });
            
            const maxAmount = Math.max(...Object.values(categoryTotals));
            const chartContainer = document.getElementById('spendingChart');
            
            chartContainer.innerHTML = Object.entries(categoryTotals)
                .map(([category, amount]) => {
                    const height = (amount / maxAmount) * 150;
                    return `
                        <div class="chart-bar" style="height: ${height}px;" title="${category}: $${amount.toFixed(2)}">
                            <div class="chart-label">${categoryIcons[category]}</div>
                        </div>
                    `;
                }).join('');
        }
        // DEAD CODE going down... features that were there that i removed, still debating might add them back
        function addChatMessage(message, isUser = false) {
            const chatMessages = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `chat-message ${isUser ? 'user' : 'ai'}`;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function askAI() {
            const input = document.getElementById('chatInput');
            const question = input.value.trim();
            
            if (!question) return;
            
            addChatMessage(question, true);
            input.value = '';
            
            const response = generateAIResponse(question);
            addChatMessage(response, false);
        }

        function askQuickQuestion(question) {
            document.getElementById('chatInput').value = question;
            askAI();
        }

        function generateAIResponse(question) {
            const now = new Date();
            const monthStartDate = new Date(monthStart);
            const currentMonthExpenses = expenses.filter(e => {
                const expenseDate = new Date(e.date);
                return expenseDate >= monthStartDate;
            });
            
            const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
            const remaining = allowance - totalSpent;
            const daysPassed = Math.floor((now - monthStartDate) / (1000 * 60 * 60 * 24));
            const daysLeft = Math.max(0, 30 - daysPassed);
            
            // Category analysis DEAD CODE
            const categoryTotals = {};
            currentMonthExpenses.forEach(e => {
                categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
            });
            const topCategory = Object.keys(categoryTotals).length > 0 ? 
                Object.keys(categoryTotals).reduce((a, b) => 
                    categoryTotals[a] > categoryTotals[b] ? a : b) : 'Food';
            
            const lowerQuestion = question.toLowerCase();
            
            if (lowerQuestion.includes('save') || lowerQuestion.includes('money')) {
                const foodSpending = categoryTotals['Food'] || 0;
                if (foodSpending > allowance * 0.4) {
                    return `You're spending $${foodSpending.toFixed(2)} on food (${((foodSpending/allowance)*100).toFixed(0)}% of budget). Try meal prepping - cooking at home could save you $${(foodSpending * 0.5).toFixed(2)} per month!`;
                }
                return `Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. You could save $${(allowance * 0.2).toFixed(2)} monthly by cutting back on ${topCategory.toLowerCase()}.`;
            }
            
            if (lowerQuestion.includes('budget') || lowerQuestion.includes('track') || lowerQuestion.includes('spending')) {
                if (remaining < 0) {
                    return `You're $${Math.abs(remaining).toFixed(2)} over budget! Try a "no-spend challenge" for 3 days and focus on free campus activities.`;
                }
                return `You have $${remaining.toFixed(2)} left for ${daysLeft} days. That's $${(remaining/Math.max(1,daysLeft)).toFixed(2)} per day. Your biggest expense is ${topCategory} at $${(categoryTotals[topCategory] || 0).toFixed(2)}.`;
            }
            
            if (lowerQuestion.includes('food') || lowerQuestion.includes('eat')) {
                return `Food budget hack: Buy generic brands (save 30%), use student discounts, and batch cook on Sundays. A $25 grocery run can make 8 meals vs $12 per takeout meal!`;
            }
            
            if (lowerQuestion.includes('student') || lowerQuestion.includes('tip')) {
                return `Student money tips: Use your student ID everywhere for discounts, attend free campus events, share streaming subscriptions, buy used textbooks, and always check for student pricing on software and services!`;
            }
            
            // Default responses based on spending status DEAD CODE TOO
            const spentPercentage = (totalSpent / allowance) * 100;
            if (spentPercentage > 80) {
                return `You've used ${spentPercentage.toFixed(0)}% of your budget. Consider free alternatives: campus gym instead of paid memberships, library study spaces, and cooking instead of eating out.`;
            } else if (spentPercentage < 50) {
                return `Great job! You're only at ${spentPercentage.toFixed(0)}% of budget. Consider setting aside some money for savings or treating yourself to something you've been wanting.`;
            } else {
                return `You're on track at ${spentPercentage.toFixed(0)}% budget used. Keep monitoring your daily spending and remember: every dollar saved is a dollar earned!`;
            }
        }

        // Keyboard shortcuts NOT DEAD CODE HERE VERY IMPORTSANT
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (document.activeElement === document.getElementById('chatInput')) {
                    askAI();
                } else if (document.activeElement === document.getElementById('expenseAmount')) {
                    addExpense();
                } else if (document.activeElement === document.getElementById('allowanceInput')) {
                    setAllowance();
                }
            }
        });

        // Auto-focus on amount input when category changes also importanyt
        document.getElementById('expenseCategory')?.addEventListener('change', () => {
            document.getElementById('expenseAmount').focus();
        });

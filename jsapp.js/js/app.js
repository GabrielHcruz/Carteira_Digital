

const CRYPTOS = {
    btc: { name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', icon: '₿' },
    eth: { name: 'Ethereum', symbol: 'ETH', color: '#627EEA', icon: 'Ξ' },
    usdt: { name: 'Tether', symbol: 'USDT', color: '#26A17B', icon: '₮' },
    bnb: { name: 'BNB', symbol: 'BNB', color: '#F3BA2F', icon: 'B' },
    sol: { name: 'Solana', symbol: 'SOL', color: '#9945FF', icon: 'S' },
    xrp: { name: 'Ripple', symbol: 'XRP', color: '#23292F', icon: 'X' },
    usdc: { name: 'USD Coin', symbol: 'USDC', color: '#2775CA', icon: '$' },
    ada: { name: 'Cardano', symbol: 'ADA', color: '#0033AD', icon: 'A' },
    doge: { name: 'Dogecoin', symbol: 'DOGE', color: '#C3A634', icon: 'Ð' },
    dot: { name: 'Polkadot', symbol: 'DOT', color: '#E6007A', icon: '●' },
    matic: { name: 'Polygon', symbol: 'MATIC', color: '#8247E5', icon: 'M' },
    avax: { name: 'Avalanche', symbol: 'AVAX', color: '#E84142', icon: 'A' },
    link: { name: 'Chainlink', symbol: 'LINK', color: '#2A5ADA', icon: '⬡' },
    ltc: { name: 'Litecoin', symbol: 'LTC', color: '#BFBBBB', icon: 'Ł' },
    trx: { name: 'TRON', symbol: 'TRX', color: '#FF0013', icon: 'T' },
    xlm: { name: 'Stellar', symbol: 'XLM', color: '#14F195', icon: '★' },
    uni: { name: 'Uniswap', symbol: 'UNI', color: '#FF007A', icon: 'U' },
    aave: { name: 'Aave', symbol: 'AAVE', color: '#B6509E', icon: 'α' },
    atom: { name: 'Cosmos', symbol: 'ATOM', color: '#16F784', icon: 'C' },
    near: { name: 'NEAR Protocol', symbol: 'NEAR', color: '#000000', icon: 'N' },
};

const EXPENSE_CATEGORIES = {
    agua: '💧 Água',
    luz: '⚡ Energia',
    gas: '🔥 Gás',
    internet: '📡 Internet',
    telefone: '📱 Telefone',
    aluguel: '🏠 Aluguel',
    alimentacao: '🛒 Alimentação',
    transporte: '🚗 Transporte',
    saude: '🏥 Saúde',
    educacao: '📚 Educação',
    diversao: '💃 Diversão',
    academia: '🏋️‍♂️ Academia',
    outro: '📋 Outro',
};

let transactions = [];
let cryptoHoldings = [];
let cryptoTransactions = [];
let nextCryptoId = 1;
let nextTransactionId = 1;
let monthlyIncome = 0;
let monthlyExpenses = {};
let cryptoPrices = {};
let selectedCryptoForAdd = null;
let currentDetailHolding = null;

function saveToLocalStorage() {
    const data = {
        monthlyIncome,
        monthlyExpenses,
        cryptoHoldings,
        cryptoTransactions,
        cryptoPrices,
        nextCryptoId,
        nextTransactionId
    };
    localStorage.setItem('carteiraDigitalData', JSON.stringify(data));
    console.log('✓ Dados salvos no localStorage');
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('carteiraDigitalData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            monthlyIncome = data.monthlyIncome || 0;
            monthlyExpenses = data.monthlyExpenses || {};
            cryptoHoldings = data.cryptoHoldings || [];
            cryptoTransactions = data.cryptoTransactions || [];
            cryptoPrices = data.cryptoPrices || {};
            nextCryptoId = data.nextCryptoId || 1;
            nextTransactionId = data.nextTransactionId || 1;
            console.log('✓ Dados carregados do localStorage');
        } catch (error) {
            console.error('✗ Erro ao carregar dados:', error);
        }
    }
}

function clearAllData() {
    monthlyIncome = 0;
    monthlyExpenses = {};
    cryptoHoldings = [];
    cryptoTransactions = [];
    cryptoPrices = {};
    nextCryptoId = 1;
    nextTransactionId = 1;
    localStorage.removeItem('carteiraDigitalData');
    console.log('✓ Todos os dados foram limpos');
}

function formatCurrency(value) {
    return 'R$ ' + Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatShort(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toFixed(0);
}

function adjustBrightness(hexColor, amount) {
    let red = parseInt(hexColor.slice(1, 3), 16) + amount;
    let green = parseInt(hexColor.slice(3, 5), 16) + amount;
    let blue = parseInt(hexColor.slice(5, 7), 16) + amount;

    red = Math.max(0, Math.min(255, red));
    green = Math.max(0, Math.min(255, green));
    blue = Math.max(0, Math.min(255, blue));

    return `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;
}

function showToast(message, backgroundColor) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    const toastElement = document.createElement('div');
    toastElement.className = 'animate-in p-4 rounded-xl border border-white/20 text-white text-sm font-500 mb-3';
    toastElement.style.background = backgroundColor || '#10b981';
    toastElement.textContent = message;
    toastContainer.appendChild(toastElement);

    setTimeout(() => {
        toastElement.remove();
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed bottom-6 right-6 z-50 flex flex-col';
    document.body.appendChild(container);
    return container;
}

function showTooltip(event, text) {
    const tooltip = document.getElementById('tooltip') || createTooltip();
    tooltip.textContent = text;
    tooltip.classList.remove('hidden');
    tooltip.style.opacity = '1';

    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = (rect.left + rect.width / 2) + 'px';
    tooltip.style.top = (rect.top - 40) + 'px';
    tooltip.style.transform = 'translateX(-50%)';
}

function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    tooltip.className = 'fixed bg-gray-900 text-white text-xs px-2 py-1 rounded hidden z-50';
    document.body.appendChild(tooltip);
    return tooltip;
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
        tooltip.style.opacity = '0';
    }
}

function getCurrentCryptoPrice(holding) {
    return cryptoPrices[holding.coin] || holding.price;
}

function calculateCryptoMetrics(holding) {
    const currentPrice = getCurrentCryptoPrice(holding);
    const investedValue = holding.amount * holding.price;
    const currentValue = holding.amount * currentPrice;
    const gain = currentValue - investedValue;
    const gainPercent = investedValue > 0 ? ((gain / investedValue) * 100).toFixed(1) : '0.0';

    return {
        investedValue,
        currentValue,
        gain,
        gainPercent: parseFloat(gainPercent),
        isGain: gain >= 0
    };
}

function groupHoldingsByCoin(holdings) {
    const grouped = {};

    holdings.forEach(holding => {

        if (!holding.coin || !CRYPTOS[holding.coin]) {
            console.warn('Criptomoeda inválida:', holding.coin);
            return;
        }

        const currentPrice = getCurrentCryptoPrice(holding);
        const value = holding.amount * currentPrice;

        if (value > 0) {
            if (!grouped[holding.coin]) {
                grouped[holding.coin] = {
                    value: 0,
                    info: CRYPTOS[holding.coin],
                    amount: 0
                };
            }
            grouped[holding.coin].value += value;
            grouped[holding.coin].amount += holding.amount;
        }
    });

    return grouped;
}

function updateCryptoHolding(coin, newAmount, newPrice) {
    const existingHolding = cryptoHoldings.find(h => h.coin === coin);

    if (existingHolding) {

        const totalValue = (existingHolding.amount * existingHolding.price) + (newAmount * newPrice);
        const totalAmount = existingHolding.amount + newAmount;
        existingHolding.price = totalValue / totalAmount;
        existingHolding.amount = totalAmount;
    } else {

        const holding = {
            id: nextCryptoId++,
            coin: coin,
            amount: newAmount,
            price: newPrice
        };
        cryptoHoldings.push(holding);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('opacity-100');
        modal.classList.remove('pointer-events-none');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (document.activeElement) {
        document.activeElement.blur();
    }

    modal.classList.remove('opacity-100');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.add('pointer-events-none');
    }, 300);
}

function getCashBalance() {
    const incomeTotal = transactions
        .filter(transaction => transaction.amount > 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenseTotal = transactions
        .filter(transaction => transaction.amount < 0)
        .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

    const monthlyExpenseTotal = Object.values(monthlyExpenses).reduce((sum, value) => sum + value, 0);
    const investedValue = cryptoHoldings.reduce((sum, holding) => sum + (holding.amount * holding.price), 0);
    const totalIncome = incomeTotal + monthlyIncome;

    return totalIncome - expenseTotal - monthlyExpenseTotal - investedValue;
}

function updateCashControls(cashBalance) {
    const expenseCategoryDropdown = document.getElementById('expenseCategoryDropdown');
    const expenseInput = document.getElementById('monthlyExpenseInput');
    const expenseSubmit = document.querySelector('#monthlyExpenseForm button[type="submit"]');
    const addCryptoButton = document.getElementById('addCryptoButton');
    const isDisabled = cashBalance <= 0;

    if (expenseCategoryDropdown) {
        expenseCategoryDropdown.classList.toggle('opacity-50', isDisabled);
        expenseCategoryDropdown.classList.toggle('pointer-events-none', isDisabled);
        expenseCategoryDropdown.setAttribute('aria-disabled', String(isDisabled));
    }

    if (expenseInput) {
        expenseInput.disabled = isDisabled;
    }

    if (expenseSubmit) {
        expenseSubmit.disabled = isDisabled;
        expenseSubmit.classList.toggle('opacity-50', isDisabled);
        expenseSubmit.classList.toggle('cursor-not-allowed', isDisabled);
    }

    if (addCryptoButton) {
        addCryptoButton.disabled = isDisabled;
        addCryptoButton.classList.toggle('opacity-50', isDisabled);
        addCryptoButton.classList.toggle('cursor-not-allowed', isDisabled);
        addCryptoButton.classList.toggle('hover:bg-amber-500/30', !isDisabled);
    }
}

function updateAll() {
    try {
        const incomeTotal = transactions
            .filter(transaction => transaction.amount > 0)
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        const expenseTotal = transactions
            .filter(transaction => transaction.amount < 0)
            .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

        const monthlyExpenseTotal = Object.values(monthlyExpenses).reduce((sum, value) => sum + value, 0);
        const totalIncome = incomeTotal + monthlyIncome;
        const totalExpense = expenseTotal + monthlyExpenseTotal;
        const cashBalance = getCashBalance();

        const portfolioValue = cryptoHoldings.reduce((sum, holding) => {
            try {
                const currentPrice = getCurrentCryptoPrice(holding);
                return sum + (holding.amount * currentPrice);
            } catch (e) {
                console.warn('Erro ao calcular holding:', e);
                return sum;
            }
        }, 0);

        const investedValue = cryptoHoldings.reduce((sum, holding) => {
            return sum + (holding.amount * holding.price);
        }, 0);

        const gain = portfolioValue - investedValue;

        const incomeDisplay = document.getElementById('incomeDisplay');
        const expenseDisplay = document.getElementById('expenseDisplay');
        const balanceDisplay = document.getElementById('balanceDisplay');
        const portfolioDisplay = document.getElementById('portfolioDisplay');
        const investedDisplay = document.getElementById('investedDisplay');
        const gainDisplay = document.getElementById('gainDisplay');

        if (incomeDisplay) incomeDisplay.textContent = formatCurrency(totalIncome);
        if (expenseDisplay) expenseDisplay.textContent = formatCurrency(totalExpense);
        if (balanceDisplay) balanceDisplay.textContent = (cashBalance >= 0 ? '' : '-') + formatCurrency(Math.abs(cashBalance));
        if (portfolioDisplay) portfolioDisplay.textContent = formatCurrency(portfolioValue);
        if (investedDisplay) investedDisplay.textContent = formatCurrency(investedValue);
        if (gainDisplay) gainDisplay.textContent = (gain >= 0 ? '+' : '') + formatCurrency(gain);

        renderCryptoList();
        renderTransactionHistory();
        render3DPie(cashBalance, portfolioValue, cryptoHoldings);
        render3DBar(totalIncome, totalExpense, cryptoHoldings);
        updateCashControls(cashBalance);

        saveToLocalStorage();
        console.log('✓ Todos os dados atualizados com sucesso');
    } catch (error) {
        console.error('✗ Erro em updateAll():', error);
        showToast('Erro ao atualizar dados', '#ef4444');
    }
}

function renderCryptoList() {
    const container = document.getElementById('cryptoListContainer');
    if (!container) return;

    container.innerHTML = '';

    if (cryptoHoldings.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-6">Nenhuma criptomoeda na carteira</p>';
        return;
    }

    cryptoHoldings.forEach(holding => {
        const cryptoInfo = CRYPTOS[holding.coin];
        if (!cryptoInfo) return;

        const metrics = calculateCryptoMetrics(holding);

        const card = document.createElement('div');
        card.className = 'flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer';
        card.innerHTML = `
            <div class="flex items-center gap-3 flex-1">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white" style="background: ${cryptoInfo.color};">
                    ${cryptoInfo.icon}
                </div>
                <div>
                    <p class="text-white text-sm font-600">${cryptoInfo.name}</p>
                    <p class="text-gray-500 text-xs">${holding.amount.toFixed(8)} ${cryptoInfo.symbol}</p>
                    <p class="text-gray-600 text-xs">Compra: ${formatCurrency(holding.price)}</p>
                </div>
            </div>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <p class="mono text-xs font-600 text-amber-400">${formatCurrency(metrics.currentValue)}</p>
                    <p class="mono text-xs font-500 ${metrics.isGain ? 'text-emerald-400' : 'text-red-400'}">
                        ${metrics.isGain ? '+' : ''}${formatCurrency(metrics.gain)} (${metrics.isGain ? '+' : ''}${metrics.gainPercent}%)
                    </p>
                </div>
                <button class="delete-btn text-gray-600 hover:text-red-400 transition-colors">
                    <i data-lucide="x" style="width: 16px; height: 16px;"></i>
                </button>
            </div>
        `;

        card.addEventListener('click', (event) => {
            if (event.target.closest('.delete-btn')) {
                event.stopPropagation();

                cryptoHoldings = cryptoHoldings.filter(h => h.id !== holding.id);

                cryptoTransactions = cryptoTransactions.filter(t => t.coin !== holding.coin);
                updateAll();
                showToast(`✓ ${cryptoInfo.name} removido!`, '#ef4444');
            } else {
                openCryptoDetailModal(holding);
            }
        });

        container.appendChild(card);
    });

    lucide.createIcons();
}

function renderTransactionHistory() {
    const container = document.getElementById('transactionList');
    if (!container) return;

    container.innerHTML = '';

    if (cryptoTransactions.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhuma transação registrada</p>';
        return;
    }

    const groupedTransactions = {};

    cryptoTransactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString('pt-BR');
        if (!groupedTransactions[date]) {
            groupedTransactions[date] = [];
        }
        groupedTransactions[date].push(transaction);
    });

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
        const dateA = new Date(a.split('/').reverse().join('-'));
        const dateB = new Date(b.split('/').reverse().join('-'));
        return dateB - dateA;
    });

    sortedDates.forEach(date => {

        const dateHeader = document.createElement('div');
        dateHeader.className = 'text-amber-400 text-sm font-600 mb-2 mt-4 first:mt-0';
        dateHeader.textContent = date;
        container.appendChild(dateHeader);

        groupedTransactions[date]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(transaction => {
                const cryptoInfo = CRYPTOS[transaction.coin];
                if (!cryptoInfo) return;

                const transactionCard = document.createElement('div');
                transactionCard.className = 'flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors';
                transactionCard.innerHTML = `
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style="background: ${cryptoInfo.color};">
                            ${cryptoInfo.icon}
                        </div>
                        <div>
                            <p class="text-white text-sm font-600">${cryptoInfo.name}</p>
                            <p class="text-gray-400 text-xs">${transaction.amount.toFixed(8)} ${cryptoInfo.symbol}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="mono text-amber-400 text-sm font-600">${formatCurrency(transaction.price)}</p>
                        <p class="text-gray-500 text-xs">${new Date(transaction.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                    </div>
                `;
                container.appendChild(transactionCard);
            });
    });
}

function openCryptoDetailModal(holding) {
    currentDetailHolding = holding;
    const cryptoInfo = CRYPTOS[holding.coin];
    if (!cryptoInfo) return;

    const metrics = calculateCryptoMetrics(holding);

    document.getElementById('modalCryptoIcon').style.background = cryptoInfo.color;
    document.getElementById('modalCryptoIcon').textContent = cryptoInfo.icon;
    document.getElementById('modalCryptoName').textContent = cryptoInfo.name;
    document.getElementById('modalCryptoSymbol').textContent = cryptoInfo.symbol;

    document.getElementById('modalTotalAmount').textContent = `${holding.amount.toFixed(8)} ${cryptoInfo.symbol}`;
    document.getElementById('modalBuyPrice').textContent = formatCurrency(holding.price);
    document.getElementById('modalCurrentPrice').textContent = formatCurrency(getCurrentCryptoPrice(holding));

    document.getElementById('modalInvestedValue').textContent = formatCurrency(metrics.investedValue);
    document.getElementById('modalCurrentValue').textContent = formatCurrency(metrics.currentValue);

    const gainContainer = document.getElementById('modalGainContainer');
    gainContainer.style.borderColor = metrics.isGain ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)';
    gainContainer.style.background = metrics.isGain ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

    document.getElementById('modalGainValue').textContent = (metrics.isGain ? '+' : '') + formatCurrency(metrics.gain);
    document.getElementById('modalGainValue').style.color = metrics.isGain ? '#10b981' : '#ef4444';
    document.getElementById('modalGainPercent').textContent = `${metrics.isGain ? '+' : ''}${metrics.gainPercent}%`;
    document.getElementById('modalGainPercent').style.color = metrics.isGain ? '#10b981' : '#ef4444';

    const icon = document.getElementById('modalGainIcon');
    icon.setAttribute('data-lucide', metrics.isGain ? 'trending-up' : 'trending-down');
    icon.style.color = metrics.isGain ? '#10b981' : '#ef4444';

    const transactionHistory = document.getElementById('transactionHistory');
    const coinTransactions = cryptoTransactions.filter(t => t.coin === holding.coin);

    if (coinTransactions.length === 0) {
        transactionHistory.innerHTML = '<p class="text-gray-500 text-xs text-center py-2">Nenhuma transação encontrada</p>';
    } else {
        transactionHistory.innerHTML = coinTransactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(transaction => {
                const date = new Date(transaction.date).toLocaleDateString('pt-BR');
                return `
                    <div class="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-white text-xs font-600">${date}</span>
                            <span class="text-amber-400 text-xs font-500">${formatCurrency(transaction.price)}</span>
                        </div>
                        <div class="text-gray-400 text-xs">
                            ${transaction.amount.toFixed(8)} ${cryptoInfo.symbol}
                        </div>
                    </div>
                `;
            }).join('');
    }

    openModal('cryptoDetailModal');
    lucide.createIcons();
}

function closeCryptoDetailModal() {
    closeModal('cryptoDetailModal');
}

function renderCryptoSelectorGrid() {
    const grid = document.getElementById('cryptoSelectorGrid');
    if (!grid) return;

    grid.innerHTML = '';

    let count = 0;
    for (const [key, cryptoInfo] of Object.entries(CRYPTOS)) {
        if (count >= 300) break;

        const card = document.createElement('div');
        card.className = 'p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/10 cursor-pointer transition-all';
        card.innerHTML = `
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white mb-3" style="background: ${cryptoInfo.color};">
                ${cryptoInfo.icon}
            </div>
            <h3 class="text-white font-600 text-sm mb-1">${cryptoInfo.name}</h3>
            <p class="text-gray-400 text-xs mb-3">${cryptoInfo.symbol}</p>
            <button class="w-full py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-400 text-xs font-600 transition-all">
                Selecionar
            </button>
        `;

        card.addEventListener('click', () => {
            openCryptoAddModal(key);
        });

        grid.appendChild(card);
        count++;
    }

    lucide.createIcons();
}

function openCryptoSelectorModal() {
    const searchInput = document.getElementById('cryptoSearchInput');
    if (searchInput) searchInput.value = '';
    renderCryptoSelectorGrid();
    openModal('cryptoSelectorModal');
}

function closeCryptoSelectorModal() {
    closeModal('cryptoSelectorModal');
}

function openCryptoAddModal(coinKey) {
    const cryptoInfo = CRYPTOS[coinKey];
    if (!cryptoInfo) return;

    selectedCryptoForAdd = coinKey;

    const modal = document.getElementById('cryptoAddModal');
    if (!modal) {
        console.warn('Modal cryptoAddModal não encontrado no HTML');
        return;
    }

    document.getElementById('addCryptoIcon').style.background = cryptoInfo.color;
    document.getElementById('addCryptoIcon').textContent = cryptoInfo.icon;
    document.getElementById('addCryptoName').textContent = cryptoInfo.name;
    document.getElementById('addCryptoSymbol').textContent = cryptoInfo.symbol;

    document.getElementById('cryptoAmountInput').value = '';
    document.getElementById('cryptoPriceInput').value = '';

    closeCryptoSelectorModal();
    openModal('cryptoAddModal');
}

function closeCryptoAddModal() {
    closeModal('cryptoAddModal');
    selectedCryptoForAdd = null;
}

function submitCryptoForm() {
    if (!selectedCryptoForAdd) return;

    const amount = parseFloat(document.getElementById('cryptoAmountInput').value);
    const price = parseFloat(document.getElementById('cryptoPriceInput').value);
    const cryptoInfo = CRYPTOS[selectedCryptoForAdd];

    if (isNaN(amount) || amount <= 0 || isNaN(price) || price <= 0) {
        showToast('Insira valores válidos para quantidade e preço', '#ef4444');
        return;
    }

    const totalCost = amount * price;
    const currentCash = getCashBalance();
    if (totalCost > currentCash) {
        showToast('Saldo insuficiente para esse investimento', '#ef4444');
        return;
    }

    const transaction = {
        id: nextTransactionId++,
        coin: selectedCryptoForAdd,
        amount: amount,
        price: price,
        date: new Date().toISOString(),
        type: 'buy'
    };

    cryptoTransactions.push(transaction);

    updateCryptoHolding(selectedCryptoForAdd, amount, price);

    closeCryptoAddModal();
    updateAll();
    showToast(`✓ ${cryptoInfo.name} adicionado à carteira!`, '#10b981');
}

function render3DPie(balance, portfolioValue, holdings) {
    const container = document.getElementById('pie3DChart');
    const emptyMessage = document.getElementById('noPieData');

    if (!container) {
        console.error('Elemento pie3DChart não encontrado');
        return;
    }

    try {
        if (balance <= 0 && portfolioValue <= 0) {
            container.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        if (emptyMessage) emptyMessage.style.display = 'none';

        const slices = [];
        if (balance > 0) {
            slices.push({
                label: 'Dinheiro',
                value: balance,
                color: '#06b6d4',
                tooltip: `Saldo em dinheiro: ${formatCurrency(balance)}`
            });
        }

        const grouped = groupHoldingsByCoin(holdings);
        Object.entries(grouped).forEach(([coinKey, group]) => {
            if (group && group.info) {
                slices.push({
                    label: group.info.symbol,
                    value: group.value,
                    color: group.info.color,
                    icon: group.info.icon,
                    tooltip: `${group.amount.toFixed(8)} ${group.info.symbol} = ${formatCurrency(group.value)}`
                });
            }
        });

        if (slices.length === 0) {
            container.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        const total = slices.reduce((sum, slice) => sum + slice.value, 0);
        if (total <= 0) {
            container.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        const centerX = 110, centerY = 100, radius = 80;
        let startAngle = -Math.PI / 2;

        let svg = `<svg viewBox="0 0 220 240" style="max-width: 220px; width: 100%;">`;

        for (let depth = 12; depth >= 0; depth--) {
            let currentAngle = -Math.PI / 2;
            slices.forEach(slice => {
                const angle = (slice.value / total) * Math.PI * 2;
                const endAngle = currentAngle + angle;
                const x1 = centerX + radius * Math.cos(currentAngle);
                const y1 = centerY + radius * Math.sin(currentAngle) + depth;
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle) + depth;
                const isLarge = angle > Math.PI ? 1 : 0;

                if (depth > 0) {
                    const darkColor = adjustBrightness(slice.color, -30 - depth * 3);
                    svg += `<path d="M${centerX},${centerY + depth} L${x1},${y1} A${radius},${radius} 0 ${isLarge} 1 ${x2},${y2} Z" fill="${darkColor}" opacity="0.8"/>`;
                }
                currentAngle = endAngle;
            });
        }

        startAngle = -Math.PI / 2;
        slices.forEach((slice, index) => {
            const angle = (slice.value / total) * Math.PI * 2;
            const endAngle = startAngle + angle;
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            const isLarge = angle > Math.PI ? 1 : 0;
            const midAngle = startAngle + angle / 2;

            svg += `<path class="pie-3d-slice" data-idx="${index}" data-tooltip="${slice.tooltip.replace(/"/g, '&quot;')}" d="M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${isLarge} 1 ${x2},${y2} Z" fill="${slice.color}" stroke="rgba(0,0,0,0.2)" stroke-width="1" style="cursor: pointer;"/>`;

            const labelX = centerX + (radius * 0.6) * Math.cos(midAngle);
            const labelY = centerY + (radius * 0.6) * Math.sin(midAngle);

            if (angle > 0.3) {
                svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="700" font-family="Outfit">${slice.label}</text>`;
            }
            startAngle = endAngle;
        });

        let legendY = 210;
        svg += `<text x="10" y="${legendY}" fill="#888" font-size="8" font-family="Outfit">`;
        slices.forEach((slice, i) => {
            const percentage = ((slice.value / total) * 100).toFixed(1);
            svg += `<tspan x="${i * 70 + 10}" dy="0" fill="${slice.color}">● </tspan><tspan fill="#aaa">${slice.label} ${percentage}%</tspan>`;
        });
        svg += `</text></svg>`;

        container.innerHTML = svg;

        document.querySelectorAll('.pie-3d-slice').forEach(slice => {
            slice.addEventListener('mouseenter', (event) => showTooltip(event, slice.dataset.tooltip));
            slice.addEventListener('mouseleave', hideTooltip);
        });

        console.log('✓ Gráfico Pizza renderizado com sucesso');
    } catch (error) {
        console.error('✗ Erro ao renderizar gráfico Pizza:', error);
        container.innerHTML = '<p class="text-red-400 text-sm">Erro ao renderizar gráfico</p>';
    }
}

function render3DBar(incomeTotal, expenseTotal, holdings) {
    const container = document.getElementById('bar3DChart');
    const emptyMessage = document.getElementById('noBarData');

    if (!container) {
        console.error('Elemento bar3DChart não encontrado');
        return;
    }

    try {
        if (incomeTotal <= 0 && expenseTotal <= 0 && holdings.length === 0) {
            container.style.display = 'none';
            if (emptyMessage) emptyMessage.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        if (emptyMessage) emptyMessage.style.display = 'none';

        const portfolioValue = holdings.reduce((sum, holding) => {
            try {
                const currentPrice = getCurrentCryptoPrice(holding);
                return sum + (holding.amount * currentPrice);
            } catch (e) {
                console.warn('Erro ao calcular valor do holding:', e);
                return sum;
            }
        }, 0);

        const max = Math.max(incomeTotal, expenseTotal, portfolioValue) * 1.1 || 100;
        const barWidth = 40;
        const spacing = 30;
        const baseY = 200;
        const scale = 150 / max;

        let svg = `<svg viewBox="0 0 300 250" style="max-width: 300px; width: 100%;">`;
        svg += `<line x1="30" y1="${baseY}" x2="280" y2="${baseY}" stroke="#444" stroke-width="2"/>`;
        svg += `<line x1="30" y1="30" x2="30" y2="${baseY}" stroke="#444" stroke-width="2"/>`;

        const incomeHeight = Math.max(0, incomeTotal * scale);
        const incomeX = 50;
        svg += `<rect x="${incomeX}" y="${baseY - incomeHeight}" width="${barWidth}" height="${incomeHeight}" fill="#10b981" opacity="0.8"/>`;
        if (incomeHeight > 0) {
            svg += `<rect x="${incomeX}" y="${baseY - incomeHeight - 4}" width="${barWidth}" height="4" fill="#059669"/>`;
        }
        svg += `<text x="${incomeX + barWidth / 2}" y="${baseY + 20}" text-anchor="middle" fill="#10b981" font-size="12" font-weight="600">Renda</text>`;
        if (incomeHeight > 0) {
            svg += `<text x="${incomeX + barWidth / 2}" y="${baseY - incomeHeight - 10}" text-anchor="middle" fill="#10b981" font-size="11">${formatShort(incomeTotal)}</text>`;
        }

        const expenseHeight = Math.max(0, expenseTotal * scale);
        const expenseX = incomeX + barWidth + spacing;
        svg += `<rect x="${expenseX}" y="${baseY - expenseHeight}" width="${barWidth}" height="${expenseHeight}" fill="#ef4444" opacity="0.8"/>`;
        if (expenseHeight > 0) {
            svg += `<rect x="${expenseX}" y="${baseY - expenseHeight - 4}" width="${barWidth}" height="4" fill="#dc2626"/>`;
        }
        svg += `<text x="${expenseX + barWidth / 2}" y="${baseY + 20}" text-anchor="middle" fill="#ef4444" font-size="12" font-weight="600">Despesa</text>`;
        if (expenseHeight > 0) {
            svg += `<text x="${expenseX + barWidth / 2}" y="${baseY - expenseHeight - 10}" text-anchor="middle" fill="#ef4444" font-size="11">${formatShort(expenseTotal)}</text>`;
        }

        const portfolioHeight = Math.max(0, portfolioValue * scale);
        const portfolioX = expenseX + barWidth + spacing;
        svg += `<rect x="${portfolioX}" y="${baseY - portfolioHeight}" width="${barWidth}" height="${portfolioHeight}" fill="#a855f7" opacity="0.8"/>`;
        if (portfolioHeight > 0) {
            svg += `<rect x="${portfolioX}" y="${baseY - portfolioHeight - 4}" width="${barWidth}" height="4" fill="#9333ea"/>`;
        }
        svg += `<text x="${portfolioX + barWidth / 2}" y="${baseY + 20}" text-anchor="middle" fill="#a855f7" font-size="12" font-weight="600">Cripto</text>`;
        if (portfolioHeight > 0) {
            svg += `<text x="${portfolioX + barWidth / 2}" y="${baseY - portfolioHeight - 10}" text-anchor="middle" fill="#a855f7" font-size="11">${formatShort(portfolioValue)}</text>`;
        }

        svg += `</svg>`;

        container.innerHTML = svg;
        console.log('✓ Gráfico Barras renderizado com sucesso');
    } catch (error) {
        console.error('✗ Erro ao renderizar gráfico Barras:', error);
        container.innerHTML = '<p class="text-red-400 text-sm">Erro ao renderizar gráfico</p>';
    }
}

function renderMonthlyIncomeList() {
    const container = document.getElementById('monthlyIncomeList');
    if (!container) {
        console.error('Container monthlyIncomeList não encontrado');
        return;
    }

    console.log('Renderizando renda mensal:', monthlyIncome);
    container.innerHTML = '';

    if (monthlyIncome > 0) {
        const card = document.createElement('div');
        card.className = 'flex items-center justify-between p-3 rounded-xl bg-emerald-900/30 border border-emerald-500/20';
        card.innerHTML = `
            <span class="text-emerald-300 font-500">Salário/Renda</span>
            <div class="flex items-center gap-2">
                <span class="mono text-emerald-400 font-600">${formatCurrency(monthlyIncome)}</span>
                <button class="text-gray-600 hover:text-red-400 transition-colors" aria-label="Remover receita">
                    <i data-lucide="x" style="width: 14px; height: 14px;"></i>
                </button>
            </div>
        `;

        card.querySelector('button').addEventListener('click', () => {
            monthlyIncome = 0;
            renderMonthlyIncomeList();
            updateAll();
            console.log('Renda mensal removida');
        });

        container.appendChild(card);
        lucide.createIcons();
        console.log('Renda mensal renderizada com sucesso');
    } else {
        console.log('Nenhuma renda mensal para renderizar');
    }
}

function renderMonthlyExpenseList() {
    const container = document.getElementById('monthlyExpenseList');
    if (!container) return;

    container.innerHTML = '';

    const clearButton = document.getElementById('clearExpensesBtn');
    if (clearButton) clearButton.style.display = Object.keys(monthlyExpenses).length > 0 ? 'block' : 'none';

    Object.entries(monthlyExpenses).forEach(([category, amount]) => {
        const card = document.createElement('div');
        card.className = 'flex items-center justify-between p-3 rounded-xl bg-red-900/30 border border-red-500/20 text-sm';
        card.innerHTML = `
            <span class="text-red-300">${EXPENSE_CATEGORIES[category]}</span>
            <div class="flex items-center gap-2">
                <span class="mono text-red-400 font-600">${formatCurrency(amount)}</span>
                <button class="text-gray-600 hover:text-red-400 transition-colors" aria-label="Remover despesa">
                    <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                </button>
            </div>
        `;

        card.querySelector('button').addEventListener('click', () => {
            delete monthlyExpenses[category];
            renderMonthlyExpenseList();
            updateAll();
        });

        container.appendChild(card);
    });

    lucide.createIcons();
}

document.getElementById('monthlyIncomeForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = parseFloat(document.getElementById('monthlyIncomeInput').value);

    if (isNaN(amount) || amount <= 0) {
        showToast('Insira um valor válido', '#ef4444');
        return;
    }

    monthlyIncome = amount;
    event.target.reset();
    showToast(`✓ Renda mensal definida em ${formatCurrency(amount)}!`, '#10b981');
    renderMonthlyIncomeList();
    updateAll();
});

document.getElementById('monthlyExpenseForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const category = document.getElementById('expenseCategorySelect').value;
    const amount = parseFloat(document.getElementById('monthlyExpenseInput').value);

    if (!category || isNaN(amount) || amount <= 0) {
        showToast('Preencha todos os campos corretamente', '#ef4444');
        return;
    }

    const previousAmount = monthlyExpenses[category] || 0;
    const currentCash = getCashBalance();
    const newCash = currentCash + previousAmount - amount;

    if (newCash < 0) {
        showToast('Saldo insuficiente para adicionar essa despesa', '#ef4444');
        return;
    }

    monthlyExpenses[category] = amount;
    event.target.reset();
    showToast(`✓ ${EXPENSE_CATEGORIES[category]} adicionado!`, '#10b981');
    renderMonthlyExpenseList();
    updateAll();
});

document.getElementById('clearExpensesBtn')?.addEventListener('click', () => {
    monthlyExpenses = {};
    renderMonthlyExpenseList();
    updateAll();
    showToast('✓ Despesas mensais limpas!', '#ef4444');
});

document.getElementById('addCryptoButton')?.addEventListener('click', () => {
    const currentCash = getCashBalance();
    if (currentCash <= 0) {
        showToast('Saldo insuficiente para investir', '#ef4444');
        return;
    }
    openCryptoSelectorModal();
});

document.getElementById('closeDetailModal')?.addEventListener('click', closeCryptoDetailModal);

document.getElementById('closeSelectorModal')?.addEventListener('click', closeCryptoSelectorModal);

document.getElementById('closeAddModalHeader')?.addEventListener('click', closeCryptoAddModal);

document.getElementById('closeAddModal')?.addEventListener('click', closeCryptoAddModal);

document.getElementById('submitCryptoFormBtn')?.addEventListener('click', submitCryptoForm);

document.getElementById('removeDetailCrypto')?.addEventListener('click', () => {
    if (currentDetailHolding) {

        cryptoHoldings = cryptoHoldings.filter(h => h.id !== currentDetailHolding.id);

        cryptoTransactions = cryptoTransactions.filter(t => t.coin !== currentDetailHolding.coin);
        closeCryptoDetailModal();
        updateAll();
        showToast(`✓ ${CRYPTOS[currentDetailHolding.coin].name} removido!`, '#ef4444');
    }
});

document.getElementById('cryptoDetailModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'cryptoDetailModal') {
        closeCryptoDetailModal();
    }
});

document.getElementById('cryptoSelectorModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'cryptoSelectorModal') {
        closeCryptoSelectorModal();
    }
});

document.getElementById('cryptoAddModal')?.addEventListener('click', (event) => {
    if (event.target.id === 'cryptoAddModal') {
        closeCryptoAddModal();
    }
});

document.getElementById('cryptoSearchInput')?.addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase();
    const grid = document.getElementById('cryptoSelectorGrid');

    if (grid) {
        grid.querySelectorAll('div').forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeCryptoDetailModal();
        closeCryptoSelectorModal();
        closeCryptoAddModal();
    }
});

function initExpenseCategoryDropdown() {
    const dropdown = document.getElementById('expenseCategoryDropdown');
    const list = document.getElementById('expenseCategoryList');
    const selectedSpan = document.getElementById('selectedCategory');
    const hiddenInput = document.getElementById('expenseCategorySelect');
    const arrow = document.getElementById('dropdownArrow');

    if (!dropdown || !list || !selectedSpan || !hiddenInput || !arrow) return;

    dropdown.addEventListener('click', () => {
        const isVisible = !list.classList.contains('hidden');
        if (isVisible) {
            hideDropdown();
        } else {
            showDropdown();
        }
    });

    list.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (li) {
            const value = li.dataset.value;
            const text = li.textContent;
            selectedSpan.textContent = text;
            hiddenInput.value = value;
            hideDropdown();
        }
    });

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target) && !list.contains(event.target)) {
            hideDropdown();
        }
    });

    dropdown.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const isVisible = !list.classList.contains('hidden');
            if (isVisible) {
                hideDropdown();
            } else {
                showDropdown();
            }
        } else if (event.key === 'Escape') {
            hideDropdown();
        }
    });

    function showDropdown() {
        list.classList.remove('hidden');
        arrow.style.transform = 'rotate(180deg)';
        dropdown.classList.add('ring-2', 'ring-red-500/50');
    }

    function hideDropdown() {
        list.classList.add('hidden');
        arrow.style.transform = 'rotate(0deg)';
        dropdown.classList.remove('ring-2', 'ring-red-500/50');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    renderMonthlyIncomeList();
    renderMonthlyExpenseList();
    updateAll();
    lucide.createIcons();

    initExpenseCategoryDropdown();

    console.log('✓ Aplicação inicializada');
});

class AkashaWebUI {
    constructor() {
        this.currentUser = null
        this.currentDataType = 'battle'
        this.sleepMode = false
        this.heartInterval = null
        this.logsPaused = false
        this.logsBuffer = []
        this.maxLogs = 1000
        this.init()
    }

    init() {
        this.setupEventListeners()
        this.loadDashboard()
        this.checkMySQLStatus() 
        setInterval(() => this.checkMySQLStatus(), 5000) // 每5秒刷新一次
        this.startHeartAnimation()
        this.checkServerStatus()
        this.setupSleepMode()
        this.loadAnimeBackground()
        this.setupRealTimeLogs()
        this.loadPluginInfo()
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault()
                this.switchSection(link.dataset.section)
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'))
                link.classList.add('active')
            })
        })

        // MySQL配置表单
        document.getElementById('mysql-config-form').addEventListener('submit', (e) => {
            e.preventDefault()
            this.saveMySQLConfig()
        })

        // MySQL连接控制
        document.getElementById('connect-mysql').addEventListener('click', () => this.connectMySQL())
        document.getElementById('disconnect-mysql').addEventListener('click', () => this.disconnectMySQL())
        document.getElementById('test-connection').addEventListener('click', () => this.testConnection())

        // 数据同步
        document.getElementById('sync-json-to-mysql').addEventListener('click', () => this.syncJsonToMySQL())
        document.getElementById('sync-mysql-to-json').addEventListener('click', () => this.syncMySQLToJson())

        // 用户管理
        document.getElementById('refresh-users').addEventListener('click', () => this.loadUsers())
        document.getElementById('data-type-select').addEventListener('change', (e) => {
            this.currentDataType = e.target.value
            if (this.currentUser) {
                this.loadUserData(this.currentUser, this.currentDataType)
            }
        })
        document.getElementById('save-user-data').addEventListener('click', () => this.saveUserData())
        // 统计信息
        document.getElementById('refresh-stats').addEventListener('click', () => this.loadStats())
        const userRankingRange = document.getElementById('user-ranking-range')
        if (userRankingRange) {
            userRankingRange.addEventListener('change', () => this.loadUserRanking())
        }
        const groupRankingRange = document.getElementById('group-ranking-range')
        if (groupRankingRange) {
            groupRankingRange.addEventListener('change', () => this.loadGroupRanking())
        }

        // 数据库查询
        const refreshTables = document.getElementById('refresh-tables')
        if (refreshTables) {
            refreshTables.addEventListener('click', () => this.loadTables())
        }
        const executeQuery = document.getElementById('execute-query')
        if (executeQuery) {
            executeQuery.addEventListener('click', () => this.executeQuery())
        }

        // 配置管理
        const configFileSelect = document.getElementById('config-file-select')
        if (configFileSelect) {
            configFileSelect.addEventListener('change', () => this.loadConfig())
        }
        const loadConfig = document.getElementById('load-config')
        if (loadConfig) {
            loadConfig.addEventListener('click', () => this.loadConfig())
        }
        const saveConfig = document.getElementById('save-config')
        if (saveConfig) {
            saveConfig.addEventListener('click', () => this.saveConfig())
        }
        
       
        const sleepMode = document.getElementById('sleep-mode')
        if (sleepMode) {
            sleepMode.addEventListener('click', () => this.wakeUp())
        }
        
       
        const refreshPlugins = document.getElementById('refresh-plugins')
        if (refreshPlugins) {
            refreshPlugins.addEventListener('click', () => this.loadPluginInfo())
        }
        
       
        const clearLogs = document.getElementById('clear-logs')
        if (clearLogs) {
            clearLogs.addEventListener('click', () => this.clearLogs())
        }
        const pauseLogs = document.getElementById('pause-logs')
        if (pauseLogs) {
            pauseLogs.addEventListener('click', () => this.toggleLogsPause())
        }
        const downloadLogs = document.getElementById('download-logs')
        if (downloadLogs) {
            downloadLogs.addEventListener('click', () => this.downloadLogs())
        }
    }

    setupSleepMode() {
        setInterval(() => {
            this.checkServerStatus()
        }, 30000) 
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/server/status')
            const result = await response.json()
            
            if (result.success && result.data.sleepMode && !this.sleepMode) {
                this.enterSleepMode()
            } else if (result.success && !result.data.sleepMode && this.sleepMode) {
                this.exitSleepMode()
            }
        } catch (error) {
            console.error('检查服务器状态失败:', error)
        }
    }

    enterSleepMode() {
        this.sleepMode = true
        document.getElementById('sleep-mode').style.display = 'flex'
        this.stopHeartAnimation()
        console.log('WebUI进入休眠模式')
    }

    
    exitSleepMode() {
        this.sleepMode = false
        document.getElementById('sleep-mode').style.display = 'none'
        this.startHeartAnimation()
        console.log('WebUI退出休眠模式')
    }

    async wakeUp() {
        try {
            await fetch('/api/server/status')
            this.exitSleepMode()
        } catch (error) {
            console.error('唤醒失败:', error)
        }
    }

    startHeartAnimation() {
        if (this.heartInterval) return
        
        this.heartInterval = setInterval(() => {
            this.createFloatingHeart()
        }, 3000) 
    }

    stopHeartAnimation() {
        if (this.heartInterval) {
            clearInterval(this.heartInterval)
            this.heartInterval = null
        }
    }

    createFloatingHeart() {
        const heartsContainer = document.getElementById('floating-hearts')
        const heart = document.createElement('div')
        heart.className = 'heart'
        heart.innerHTML = '💖'
        
       
        heart.style.left = Math.random() * 100 + '%'
        heart.style.animationDelay = Math.random() * 2 + 's'
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's'
        
        heartsContainer.appendChild(heart)
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart)
            }
        }, 7000)
    }

    switchSection(section) {

        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'))
        document.getElementById(section).classList.add('active')
        switch (section) {
            case 'dashboard':
                this.loadDashboard()
                break
            case 'mysql':
                this.loadMySQLConfig()
                break
            case 'users':
                this.loadUsers()
                break
            case 'stats':
                this.loadStats()
                break
            case 'database':
                this.loadTables()
                break
            case 'config':
                this.loadConfig()
                break
        }
    }

    async loadDashboard() {
        this.checkMySQLStatus()
        this.loadStats()
    }

    async checkMySQLStatus() {
        try {
            const response = await fetch('/api/mysql/status')
            const result = await response.json()
            
            if (result.success) {
                const connected = result.data.connected
                const indicator = document.getElementById('mysql-status-indicator')
                const text = document.getElementById('mysql-status-text')
                const connectionIndicator = document.getElementById('mysql-connection-indicator')
                const connectionText = document.getElementById('mysql-connection-text')
                
                if (connected) {
                    indicator.className = 'status-indicator status-connected'
                    text.textContent = 'MySQL已连接'
                    if (connectionIndicator) {
                        connectionIndicator.className = 'status-indicator status-connected'
                        connectionText.textContent = '已连接'
                    }
                } else {
                    indicator.className = 'status-indicator status-disconnected'
                    text.textContent = 'MySQL未连接'
                    if (connectionIndicator) {
                        connectionIndicator.className = 'status-indicator status-disconnected'
                        connectionText.textContent = '未连接'
                    }
                }
            }
        } catch (error) {
            console.error('检查MySQL状态失败:', error)
        }
    }

    async loadMySQLConfig() {
        try {
            const response = await fetch('/api/mysql/config')
            const result = await response.json()
            
            if (result.success) {
                const config = result.data
                document.getElementById('mysql-enabled').checked = config.enabled
                document.getElementById('mysql-host').value = config.host || 'localhost'
                document.getElementById('mysql-port').value = config.port || 3306
                document.getElementById('mysql-user').value = config.user || 'root'
                document.getElementById('mysql-database').value = config.database || 'akasha_terminal'
            }
        } catch (error) {
            this.showToast('加载MySQL配置失败: ' + error.message, 'error')
        }
    }

    async saveMySQLConfig() {
        const button = document.querySelector('#mysql-config-form button[type="submit"]')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const config = {
                enabled: document.getElementById('mysql-enabled').checked,
                host: document.getElementById('mysql-host').value,
                port: parseInt(document.getElementById('mysql-port').value),
                user: document.getElementById('mysql-user').value,
                password: document.getElementById('mysql-password').value,
                database: document.getElementById('mysql-database').value
            }
            
            const response = await fetch('/api/mysql/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            
            const result = await response.json()
            
            if (result.success) {
                this.showToast('MySQL配置保存成功', 'success')
                document.getElementById('mysql-password').value = '' // 清空密码字段，这里可能不太友好，先保留，后续会修改
            } else {
                this.showToast('保存失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('保存失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async connectMySQL() {
        const button = document.getElementById('connect-mysql')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const response = await fetch('/api/mysql/connect', { method: 'POST' })
            const result = await response.json()
            
            if (result.success) {
                this.showToast('MySQL连接成功', 'success')
                this.checkMySQLStatus()
            } else {
                this.showToast('连接失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('连接失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async disconnectMySQL() {
        const button = document.getElementById('disconnect-mysql')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const response = await fetch('/api/mysql/disconnect', { method: 'POST' })
            const result = await response.json()
            
            if (result.success) {
                this.showToast('MySQL连接已断开', 'success')
                this.checkMySQLStatus()
            } else {
                this.showToast('断开失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('断开失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async testConnection() {
        const button = document.getElementById('test-connection')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const response = await fetch('/api/mysql/status')
            const result = await response.json()
            
            if (result.success) {
                const connected = result.data.connected
                this.showToast(connected ? 'MySQL连接正常' : 'MySQL未连接', connected ? 'success' : 'warning')
            } else {
                this.showToast('测试失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('测试失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async syncJsonToMySQL() {
        const button = document.getElementById('sync-json-to-mysql')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const response = await fetch('/api/sync/json-to-mysql', { method: 'POST' })
            const result = await response.json()
            
            if (result.success) {
                this.showToast('JSON数据同步到MySQL成功', 'success')
            } else {
                this.showToast('同步失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('同步失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async syncMySQLToJson() {
        const button = document.getElementById('sync-mysql-to-json')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const response = await fetch('/api/sync/mysql-to-json', { method: 'POST' })
            const result = await response.json()
            
            if (result.success) {
                this.showToast('MySQL数据同步到JSON成功', 'success')
            } else {
                this.showToast('同步失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('同步失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users')
            const result = await response.json()
            
            if (result.success) {
                const tbody = document.querySelector('#users-table tbody')
                tbody.innerHTML = ''
                
                result.data.forEach(user => {
                    const row = document.createElement('tr')
                    row.innerHTML = `
                        <td>${user.user_id}</td>
                        <td>
                            <button class="btn btn-sm btn-primary me-2" onclick="webui.editUser('${user.user_id}')">
                                <i class="bi bi-pencil"></i> 编辑
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="webui.deleteUser('${user.user_id}')">
                                <i class="bi bi-trash"></i> 删除
                            </button>
                        </td>
                    `
                    tbody.appendChild(row)
                })
            } else {
                this.showToast('加载用户列表失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('加载用户列表失败: ' + error.message, 'error')
        }
    }

    async editUser(userId) {
        this.currentUser = userId
        this.currentDataType = document.getElementById('data-type-select').value
        
        await this.loadUserData(userId, this.currentDataType)
        
        const modal = new bootstrap.Modal(document.getElementById('userDataModal'))
        modal.show()
    }

    async loadUserData(userId, dataType) {
        try {
            const response = await fetch(`/api/users/${userId}/${dataType}`)
            const result = await response.json()
            
            if (result.success) {
                document.getElementById('user-data-editor').value = JSON.stringify(result.data, null, 2)
            } else {
                document.getElementById('user-data-editor').value = '{}'
                this.showToast('用户数据不存在，将创建新数据', 'info')
            }
        } catch (error) {
            this.showToast('加载用户数据失败: ' + error.message, 'error')
        }
    }

    async saveUserData() {
        const button = document.getElementById('save-user-data')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const dataText = document.getElementById('user-data-editor').value
            let data
            
            try {
                data = JSON.parse(dataText)
            } catch (e) {
                this.showToast('JSON格式错误: ' + e.message, 'error')
                return
            }
            
            const response = await fetch(`/api/users/${this.currentUser}/${this.currentDataType}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            
            const result = await response.json()
            
            if (result.success) {
                this.showToast('用户数据保存成功', 'success')
                const modal = bootstrap.Modal.getInstance(document.getElementById('userDataModal'))
                modal.hide()
            } else {
                this.showToast('保存失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('保存失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async deleteUser(userId) {
        if (!confirm(`确定要删除用户 ${userId} 的所有数据吗？此操作不可恢复！`)) {
            return
        }
        
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
            const result = await response.json()
            
            if (result.success) {
                this.showToast('用户数据删除成功', 'success')
                this.loadUsers()
            } else {
                this.showToast('删除失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('删除失败: ' + error.message, 'error')
        }
    }

    async loadStats() {
        await this.loadDashboardStats()
        try {
            const response = await fetch('/api/stats/commands?limit=100')
            const result = await response.json()
            
            if (result.success) {
                const tbody = document.querySelector('#stats-table tbody')
                tbody.innerHTML = ''
                
                result.data.forEach(stat => {
                    const row = document.createElement('tr')
                    row.innerHTML = `
                        <td>${stat.command}</td>
                        <td>${stat.user_id}</td>
                        <td>${stat.total_count}</td>
                        <td>${stat.success_count}</td>
                        <td>${stat.fail_count}</td>
                        <td>${new Date(stat.last_used).toLocaleString()}</td>
                    `
                    tbody.appendChild(row)
                })
            } else {
                this.showToast('加载统计数据失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('加载统计数据失败: ' + error.message, 'error')
        }
    }

    async loadDashboardStats() {
        try {
            const response = await fetch('/api/stats/users')
            const result = await response.json()
            
            if (result.success) {
                const data = result.data
                document.getElementById('total-users').textContent = data.total_users || 0
                document.getElementById('total-commands').textContent = data.total_commands || 0
                const successRate = data.total_commands > 0 
                    ? ((data.successful_commands / data.total_commands) * 100).toFixed(1) + '%'
                    : '0%'
                document.getElementById('success-rate').textContent = successRate
            } else {
                this.showToast('加载仪表板统计失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('加载仪表板统计失败: ' + error.message, 'error')
            document.getElementById('total-users').textContent = '-'
            document.getElementById('total-commands').textContent = '-'
            document.getElementById('success-rate').textContent = '-'
        }
    }

    async loadTables() {
        try {
            const response = await fetch('/api/database/tables')
            const result = await response.json()
            
            if (result.success) {
                const container = document.getElementById('tables-info')
                container.innerHTML = ''
                
                result.data.forEach(table => {
                    const div = document.createElement('div')
                    div.className = 'mb-2 p-2 border rounded'
                    div.innerHTML = `
                        <strong>${table.name}</strong><br>
                        <small class="text-muted">${table.rows} 行数据</small>
                    `
                    container.appendChild(div)
                })
            } else {
                this.showToast('加载表信息失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('加载表信息失败: ' + error.message, 'error')
        }
    }

    async executeQuery() {
        const button = document.getElementById('execute-query')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const query = document.getElementById('sql-query').value.trim()
            
            if (!query) {
                this.showToast('请输入SQL查询语句', 'warning')
                return
            }
            
            const response = await fetch('/api/database/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            })
            
            const result = await response.json()
            
            if (result.success) {
                this.displayQueryResults(result.data)
            } else {
                this.showToast('查询失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('查询失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    displayQueryResults(data) {
        const container = document.getElementById('query-results')
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="alert alert-info">查询结果为空</div>'
            return
        }
        
        const table = document.createElement('table')
        table.className = 'table table-striped table-sm'
        
        const thead = document.createElement('thead')
        const headerRow = document.createElement('tr')
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th')
            th.textContent = key
            headerRow.appendChild(th)
        })
        thead.appendChild(headerRow)
        table.appendChild(thead)
        
        const tbody = document.createElement('tbody')
        data.forEach(row => {
            const tr = document.createElement('tr')
            Object.values(row).forEach(value => {
                const td = document.createElement('td')
                td.textContent = value !== null ? value : 'NULL'
                tr.appendChild(td)
            })
            tbody.appendChild(tr)
        })
        table.appendChild(tbody)
        
        container.innerHTML = ''
        container.appendChild(table)
    }

    async loadConfig() {
        const button = document.getElementById('load-config')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const response = await fetch('/api/plugin/config')
            const result = await response.json()
            
            if (result.success) {
                const filename = document.getElementById('config-file-select').value
                const content = result.data[filename] || ''
                document.getElementById('config-editor').value = content
            } else {
                this.showToast('加载配置失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('加载配置失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    async saveConfig() {
        const button = document.getElementById('save-config')
        const loading = button.querySelector('.loading')
        
        try {
            loading.classList.add('show')
            button.disabled = true
            
            const filename = document.getElementById('config-file-select').value
            const content = document.getElementById('config-editor').value
            
            const response = await fetch('/api/plugin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, content })
            })
            
            const result = await response.json()
            
            if (result.success) {
                this.showToast('配置保存成功', 'success')
            } else {
                this.showToast('保存失败: ' + result.error, 'error')
            }
        } catch (error) {
            this.showToast('保存失败: ' + error.message, 'error')
        } finally {
            loading.classList.remove('show')
            button.disabled = false
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast')
        const toastBody = document.getElementById('toast-body')
        
      
        toastBody.textContent = message
        
       
        toast.className = 'toast'
        if (type === 'success') {
            toast.classList.add('bg-success', 'text-white')
        } else if (type === 'error') {
            toast.classList.add('bg-danger', 'text-white')
        } else if (type === 'warning') {
            toast.classList.add('bg-warning')
        } else {
            toast.classList.add('bg-info', 'text-white')
        }
        
        
        const bsToast = new bootstrap.Toast(toast)
        bsToast.show()
    }
    
   
    async loadAnimeBackground() {
        try {
            const bodyBefore = document.querySelector('body::before') || document.body
            bodyBefore.classList.add('background-loading')
            const apiUrls = [
                'https://api.waifu.pics/sfw/waifu',
                'https://api.waifu.im/search/?included_tags=waifu&height=>=1080',
                'https://nekos.life/api/v2/img/waifu'
            ]//背景api
            
            for (const apiUrl of apiUrls) {
                try {
                    const response = await fetch(apiUrl)
                    const data = await response.json()
                    
                    let imageUrl = ''
                    if (data.url) {
                        imageUrl = data.url
                    } else if (data.images && data.images[0]) {
                        imageUrl = data.images[0].url
                    }
                    
                    if (imageUrl) {
                        // 这里是预加载图片
                        const img = new Image()
                        img.onload = () => {
                            document.body.style.setProperty('--bg-image', `url('${imageUrl}')`)
                            const style = document.createElement('style')
                            style.textContent = `body::before { background-image: var(--bg-image); }`
                            document.head.appendChild(style)
                            bodyBefore.classList.remove('background-loading')
                        }
                        img.src = imageUrl
                        break
                    }
                } catch (error) {
                    console.warn(`API ${apiUrl} 失败:`, error)
                    continue
                }
            }
        } catch (error) {
            console.error('加载背景图片失败:', error)
        }
    }
    
    setupRealTimeLogs() {
        this.connectLogWebSocket()
        setInterval(() => {
            if (!this.logsPaused) {
                this.fetchLogs()
            }
        }, 2000)
    }
    
    connectLogWebSocket() {
        try {//日志使用ws请求
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
            const wsUrl = `${protocol}//${window.location.host}/ws/logs`
            
            this.logWebSocket = new WebSocket(wsUrl)
            
            this.logWebSocket.onmessage = (event) => {
                if (!this.logsPaused) {
                    const logData = JSON.parse(event.data)
                    this.addLogEntry(logData)
                }
            }
            
            this.logWebSocket.onerror = () => {
                console.warn('WebSocket连接失败，使用轮询方式获取日志')
            }
        } catch (error) {
            console.warn('WebSocket不可用，使用轮询方式获取日志')
        }
    }
    
    async fetchLogs() {
        try {
            const response = await fetch('/api/logs/recent')
            const result = await response.json()
            
            if (result.success && result.data) {
                result.data.forEach(log => this.addLogEntry(log))
            }
        } catch (error) {
            console.error('获取日志失败:', error)
        }
    }
    
    addLogEntry(logData) {
        const container = document.getElementById('log-container')
        const logEntry = document.createElement('div')
        logEntry.className = 'log-entry'
        
        const timestamp = new Date(logData.timestamp || Date.now()).toLocaleTimeString()
        const level = logData.level || 'INFO'
        const message = logData.message || logData
        const source = logData.source || '系统'
        
        let levelClass = 'text-info'
        if (level === 'ERROR') levelClass = 'text-danger'
        else if (level === 'WARN') levelClass = 'text-warning'
        else if (level === 'SUCCESS') levelClass = 'text-success'
        
        logEntry.innerHTML = `
            <span class="text-muted">[${timestamp}]</span>
            <span class="${levelClass}">[${level}]</span>
            <span class="text-primary">[${source}]</span>
            <span>${message}</span>
        `
        container.appendChild(logEntry)
        const entries = container.querySelectorAll('.log-entry')
        if (entries.length > this.maxLogs) {
            entries[0].remove()
        }
        container.scrollTop = container.scrollHeight
    }
    
    clearLogs() {
        const container = document.getElementById('log-container')
        container.innerHTML = '<div class="log-entry"><span class="text-muted">[系统]</span> 日志已清空</div>'
    }
    
    toggleLogsPause() {
        this.logsPaused = !this.logsPaused
        const button = document.getElementById('pause-logs')
        const icon = button.querySelector('i')
        
        if (this.logsPaused) {
            icon.className = 'bi bi-play'
            button.innerHTML = '<i class="bi bi-play"></i> 继续'
            button.classList.remove('btn-outline-warning')
            button.classList.add('btn-outline-success')
        } else {
            icon.className = 'bi bi-pause'
            button.innerHTML = '<i class="bi bi-pause"></i> 暂停'
            button.classList.remove('btn-outline-success')
            button.classList.add('btn-outline-warning')
        }
    }
    
    //下载
    downloadLogs() {
        const container = document.getElementById('log-container')
        const logs = Array.from(container.querySelectorAll('.log-entry'))
            .map(entry => entry.textContent.trim())
            .join('\n')
        
        const blob = new Blob([logs], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `akasha-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    
    async loadPluginInfo() {
        try {
            const response = await fetch('/api/plugins/info')
            const result = await response.json()
            
            if (result.success) {
                const data = result.data
                
                document.getElementById('total-plugins').textContent = data.total || 0
                document.getElementById('avg-load-time').textContent = data.avgLoadTime ? `${data.avgLoadTime}ms` : '-'
                document.getElementById('plugin-status').textContent = data.status || '正常'
                
                const tbody = document.getElementById('plugin-list')
                tbody.innerHTML = ''
                
                if (data.plugins && data.plugins.length > 0) {
                    data.plugins.forEach((plugin, index) => {
                        const row = document.createElement('tr')
                        const descriptionId = `desc-${index}`
                        const editBtnId = `edit-${index}`
                        
                        row.innerHTML = `
                            <td>${plugin.name || '-'}</td>
                            <td>${plugin.version || '-'}</td>
                            <td>${plugin.loadTime ? `${plugin.loadTime}ms` : '-'}</td>
                            <td>
                                <span class="badge ${plugin.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                    ${plugin.status === 'active' ? '运行中' : '未知'}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex align-items-center">
                                    <span id="${descriptionId}" class="flex-grow-1">${plugin.description || '-'}</span>
                                    ${plugin.canEdit ? `
                                        <button id="${editBtnId}" class="btn btn-sm btn-outline-primary ms-2" 
                                                onclick="webui.editPluginDescription('${plugin.name}', '${descriptionId}', '${editBtnId}')">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        `
                        tbody.appendChild(row)
                    })
                } else {
                    tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无插件信息</td></tr>'
                }
            }
        } catch (error) {
            console.error('加载插件信息失败:', error)
            document.getElementById('plugin-list').innerHTML = '<tr><td colspan="5" class="text-center text-danger">加载失败</td></tr>'
        }
    }
    
   
    editPluginDescription(pluginName, descriptionId, editBtnId) {
        const descSpan = document.getElementById(descriptionId)
        const editBtn = document.getElementById(editBtnId)
        const currentDesc = descSpan.textContent
        
        
        const input = document.createElement('input')
        input.type = 'text'
        input.className = 'form-control form-control-sm'
        input.value = currentDesc === '-' ? '' : currentDesc
        input.style.minWidth = '200px'
        const saveBtn = document.createElement('button')
        saveBtn.className = 'btn btn-sm btn-success ms-1'
        saveBtn.innerHTML = '<i class="bi bi-check"></i>'
        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'btn btn-sm btn-secondary ms-1'
        cancelBtn.innerHTML = '<i class="bi bi-x"></i>'
        const container = descSpan.parentElement
        container.innerHTML = ''
        container.appendChild(input)
        container.appendChild(saveBtn)
        container.appendChild(cancelBtn)
        
        input.focus()
        input.select()
        
        const saveDescription = async () => {
            const newDesc = input.value.trim()
            if (!newDesc) {
                alert('描述不能为空')
                return
            }
            
            try {
                const response = await fetch('/api/plugins/description', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        pluginName: pluginName,
                        description: newDesc
                    })
                })
                
                const result = await response.json()
                if (result.success) {
                    container.innerHTML = `
                        <span id="${descriptionId}" class="flex-grow-1">${newDesc}</span>
                        <button id="${editBtnId}" class="btn btn-sm btn-outline-primary ms-2" 
                                onclick="webui.editPluginDescription('${pluginName}', '${descriptionId}', '${editBtnId}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                    `
                } else {
                    alert('保存失败: ' + result.error)
                }
            } catch (error) {
                console.error('保存插件描述失败:', error)
                alert('保存失败，请重试')
            }
        }
        
        const cancelEdit = () => {
            container.innerHTML = `
                <span id="${descriptionId}" class="flex-grow-1">${currentDesc}</span>
                <button id="${editBtnId}" class="btn btn-sm btn-outline-primary ms-2" 
                        onclick="webui.editPluginDescription('${pluginName}', '${descriptionId}', '${editBtnId}')">
                    <i class="bi bi-pencil"></i>
                </button>
            `
        }
        
        // 绑定事件
        saveBtn.addEventListener('click', saveDescription)
        cancelBtn.addEventListener('click', cancelEdit)
        
        // 回车保存，ESC取消
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                saveDescription()
            } else if (e.key === 'Escape') {
                cancelEdit()
            }
        })
    }

}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const webui = new AkashaWebUI()
    window.webui = webui
})
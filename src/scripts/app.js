// ============================================
// Developer Habit Tracker Application
// ============================================

class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.logs = this.loadLogs();
        this.init();
    }

    // ============ INITIALIZATION ============
    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        document.getElementById('habitForm').addEventListener('submit', (e) => this.addHabit(e));
    }

    // ============ DATA MANAGEMENT ============
    loadHabits() {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved) : [];
    }

    loadLogs() {
        const saved = localStorage.getItem('logs');
        return saved ? JSON.parse(saved) : [];
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    saveLogs() {
        localStorage.setItem('logs', JSON.stringify(this.logs));
    }

    // ============ HABIT MANAGEMENT ============
    addHabit(e) {
        e.preventDefault();

        const name = document.getElementById('habitName').value.trim();
        const category = document.getElementById('habitCategory').value;
        const goal = parseInt(document.getElementById('habitGoal').value) || 30;

        if (!name || !category) {
            alert('Please fill in all required fields');
            return;
        }

        const habit = {
            id: Date.now(),
            name,
            category,
            goal,
            createdAt: new Date().toISOString(),
            streak: 0,
            lastCompleted: null,
            totalCompleted: 0
        };

        this.habits.push(habit);
        this.saveHabits();

        // Reset form
        document.getElementById('habitForm').reset();

        this.render();
    }

    deleteHabit(id) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.render();
        }
    }

    completeHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = this.getTodayDate();
        const lastCompleted = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
        const today_date = new Date(today);

        // Check if already completed today
        if (lastCompleted && this.isSameDay(lastCompleted, today_date)) {
            alert('You\'ve already completed this habit today! 🎉');
            return;
        }

        // Update streak
        if (lastCompleted && this.isYesterday(lastCompleted, today_date)) {
            habit.streak++;
        } else if (!lastCompleted) {
            habit.streak = 1;
        } else {
            habit.streak = 1;
        }

        habit.lastCompleted = today;
        habit.totalCompleted++;

        this.saveHabits();

        // Log the completion
        this.logCompletion(id, habit.name);

        this.render();
    }

    // ============ LOGGING ============
    logCompletion(habitId, habitName) {
        const log = {
            habitId,
            habitName,
            completedAt: new Date().toISOString()
        };

        this.logs.push(log);
        this.saveLogs();
    }

    removeLog(logIndex) {
        this.logs.splice(logIndex, 1);
        this.saveLogs();
        this.render();
    }

    // ============ STATISTICS ============
    calculateStats() {
        const totalHabits = this.habits.length;
        const today = this.getTodayDate();
        const todayStart = new Date(today).setHours(0, 0, 0, 0);

        const completedToday = this.logs.filter(log => {
            const logDate = new Date(log.completedAt).setHours(0, 0, 0, 0);
            return logDate === todayStart;
        }).length;

        const longestStreak = this.habits.length > 0 
            ? Math.max(...this.habits.map(h => h.streak), 0) 
            : 0;

        const totalDone = this.habits.reduce((sum, h) => sum + h.totalCompleted, 0);
        const totalGoal = this.habits.reduce((sum, h) => sum + (h.goal || 30), 0);
        const overallProgress = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0;

        return {
            totalHabits,
            completedToday,
            longestStreak,
            overallProgress
        };
    }

    // ============ UTILITY FUNCTIONS ============
    getTodayDate() {
        const today = new Date();
        return today.toISOString().split('T')[0];
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    isYesterday(date1, date2) {
        const yesterday = new Date(date2);
        yesterday.setDate(yesterday.getDate() - 1);
        return date1.toDateString() === yesterday.toDateString();
    }

    getDaysAgo(date) {
        const today = new Date();
        const diffTime = today - new Date(date);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    getCategoryEmoji(category) {
        const emojis = {
            coding: '💻',
            learning: '📚',
            documentation: '📝',
            review: '👀',
            testing: '🧪',
            community: '🤝'
        };
        return emojis[category] || '✨';
    }

    // ============ RENDERING ============
    render() {
        this.renderStats();
        this.renderHabits();
        this.renderDailyLog();
    }

    renderStats() {
        const stats = this.calculateStats();

        document.getElementById('totalHabits').textContent = stats.totalHabits;
        document.getElementById('completedToday').textContent = stats.completedToday;
        document.getElementById('longestStreak').textContent = stats.longestStreak;
        document.getElementById('overallProgress').textContent = stats.overallProgress + '%';
    }

    renderHabits() {
        const habitsList = document.getElementById('habitsList');

        if (this.habits.length === 0) {
            habitsList.innerHTML = '<p class="empty-state">No habits yet. Add one to get started! 🎯</p>';
            return;
        }

        habitsList.innerHTML = this.habits.map(habit => {
            const today = this.getTodayDate();
            const isCompletedToday = habit.lastCompleted && habit.lastCompleted === today;
            const progressPercent = habit.goal > 0 ? Math.min((habit.totalCompleted / habit.goal) * 100, 100) : 0;

            return `
                <div class="habit-card ${isCompletedToday ? 'completed' : ''}">
                    <h3>${habit.name}</h3>
                    <span class="habit-category">${this.getCategoryEmoji(habit.category)} ${habit.category}</span>
                    
                    <div class="habit-stats">
                        <div class="habit-stat">
                            <div class="habit-stat-value">${habit.streak}</div>
                            <div class="habit-stat-label">Current Streak</div>
                        </div>
                        <div class="habit-stat">
                            <div class="habit-stat-value">${habit.totalCompleted}</div>
                            <div class="habit-stat-label">Total Done</div>
                        </div>
                        <div class="habit-stat">
                            <div class="habit-stat-value">${habit.goal}</div>
                            <div class="habit-stat-label">Daily Goal</div>
                        </div>
                    </div>

                    <div class="habit-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                    </div>

                    <div class="habit-actions">
                        <button 
                            class="btn btn-success btn-small"
                            onclick="tracker.completeHabit(${habit.id})"
                            ${isCompletedToday ? 'disabled' : ''}
                        >
                            ${isCompletedToday ? '✓ Done Today' : 'Complete'}
                        </button>
                        <button 
                            class="btn btn-secondary btn-small"
                            onclick="tracker.deleteHabit(${habit.id})"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDailyLog() {
        const dailyLog = document.getElementById('dailyLog');
        const today = this.getTodayDate();
        const todayLogs = this.logs.filter(log => {
            return log.completedAt.startsWith(today);
        });

        if (todayLogs.length === 0) {
            dailyLog.innerHTML = '<p class="empty-state">Complete habits to log your progress 📝</p>';
            return;
        }

        dailyLog.innerHTML = todayLogs.map((log, index) => {
            const time = new Date(log.completedAt).toLocaleTimeString();
            return `
                <div class="log-entry completed">
                    <div class="log-entry-info">
                        <h4>✅ ${log.habitName}</h4>
                        <div class="log-time">Completed at ${time}</div>
                    </div>
                    <span 
                        class="log-remove" 
                        onclick="tracker.removeLog(${index})"
                        title="Remove this log"
                    >
                        ✕
                    </span>
                </div>
            `;
        }).join('');
    }
}

// ============ INITIALIZE APP ============
let tracker;

document.addEventListener('DOMContentLoaded', () => {
    tracker = new HabitTracker();
});

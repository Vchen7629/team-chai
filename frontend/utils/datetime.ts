
function generateTodayDate() {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0') // js returns 0 indexed month
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function generateTomorrowDate() {
    const now = new Date()
    now.setDate(now.getDate() + 1)

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

export { generateTodayDate, generateTomorrowDate }
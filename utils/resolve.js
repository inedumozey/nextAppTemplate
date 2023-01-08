const resolve = {
    makeReactSelectOptions: (array) => {
        return array?.map(item => {
            return { value: item, label: item }
        })
    },

    resolveInvestmentLifespan: (percentage, sec) => {

        const lifeSpanInSecond = () => {
            return `${percentage}% in ${Math.floor(Number(sec))} Second${Math.floor(Number(sec)) > 1 ? 's' : ''}`
        }

        const lifeSpanInMinute = () => {
            return `${percentage}% in ${Math.floor(Number(sec) / 60)}  Minute${Math.floor(Number(sec) / 60) > 1 ? 's' : ''}`
        }

        const lifeSpanInHour = () => {
            return `${percentage}% in ${Math.floor(Number(sec) / (60 * 60))}  Hour${Math.floor(Number(sec) / (60 * 60)) > 1 ? 's' : ''}`
        }

        const lifeSpanInDay = () => {
            return `${percentage}% in ${Math.floor(Number(sec) / (60 * 60 * 24))}  Day${Math.floor(Number(sec) / (60 * 60 * 24)) > 1 ? 's' : ''}`
        }


        // returns seconds
        if (sec < 60) {
            return lifeSpanInSecond()
        }

        // returns minutes
        if (sec >= 60 && sec < 60 * 60) {
            return lifeSpanInMinute()
        }

        // returns hours
        if (sec >= 60 * 60 && sec < 60 * 60 * 24) {
            return lifeSpanInHour()
        }

        // returns days
        if (sec >= 60 * 60 * 24) {
            return lifeSpanInDay()
        }
    },

    position: (n) => {
        //get the last always
        const num = n.toString()
        const lastDigit = +(num[num.length - 1])

        // check if lastDigit is 1 and n is not 11, add st
        if (lastDigit === 1 && n !== 11) {
            return 'st'
        }

        // check if lastDigit is 2 and n is not 12, add nd
        else if (lastDigit === 2 && n !== 12) {
            return 'nd'
        }

        // check if lastDigit is 3 and n is not 13, add rd
        else if (lastDigit === 3 && n !== 13) {
            return 'rd'
        }

        // any other number, add th
        else {
            return 'th'
        }
    },

    resolveSeconds: (sec) => {

        const lifeSpanInSecond = () => {
            return `${Math.floor(Number(sec))} Second${Math.floor(Number(sec)) > 1 ? 's' : ''}`
        }

        const lifeSpanInMinute = () => {
            return `${Math.floor(Number(sec) / 60)}  Minute${Math.floor(Number(sec) / 60) > 1 ? 's' : ''}`
        }

        const lifeSpanInHour = () => {
            return `${Math.floor(Number(sec) / (60 * 60))}  Hour${Math.floor(Number(sec) / (60 * 60)) > 1 ? 's' : ''}`
        }

        const lifeSpanInDay = () => {
            return `${Math.floor(Number(sec) / (60 * 60 * 24))}  Day${Math.floor(Number(sec) / (60 * 60 * 24)) > 1 ? 's' : ''}`
        }


        // returns seconds
        if (sec < 60) {
            return lifeSpanInSecond()
        }

        // returns minutes
        if (sec >= 60 && sec < 60 * 60) {
            return lifeSpanInMinute()
        }

        // returns hours
        if (sec >= 60 * 60 && sec < 60 * 60 * 24) {
            return lifeSpanInHour()
        }

        // returns days
        if (sec >= 60 * 60 * 24) {
            return lifeSpanInDay()
        }
    }

}

export default resolve;
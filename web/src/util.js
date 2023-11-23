// eslint-disable-next-line import/no-anonymous-default-export
export default {
    hourToMinutes: (hourMinute) => {
        const [hour, minutes] = hourMinute.split(':');
        return parseInt(parseInt(hour) * 60 * parseInt(minutes));
    },
};
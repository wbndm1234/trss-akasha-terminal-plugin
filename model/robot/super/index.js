class UsperIndex {
    getUser = ({ name = 'home', dsc = 'home', event = 'message', priority = 400, rule }) => {
        return { name, dsc, event, priority, rule }
    }
}
export default new UsperIndex()
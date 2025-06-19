/**用户数据合成类*/
class UserInformation {
    userDataShow = async ({ UID }) => {
        return {
            /*地址 */
            path: 'user/information',
            /*html名*/
            name: 'information',
            /*向html传入变量*/
            data: {
                user_id: UID
            }
        }
    }
}
export default new UserInformation()
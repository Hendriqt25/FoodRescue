class ChatbotModel {
    constructor(data){
        this.message = data.message;
    }

    validate(){
        if(!this.message || this.message.trim() === ""){
            return {
                isValid: false,
                message: "Pesan wajib diisi"
            }
        }
        
        return {
            isValid: true,
            message: "Pesan Valid"
        }
    }

    toPayload(){
        return{
            message: this.message.trim(),
        }
    }
}

module.exports = ChatbotModel;

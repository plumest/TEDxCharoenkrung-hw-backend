const socket = io.connect('http://localhost:5050');

const app = new Vue({
   el: '#app',
   data: () => {
       return {
           collection: []
       }
   },
    created() {
       socket.on('collection', data => {
           this.collection.push(data.task);
       })
    }
});
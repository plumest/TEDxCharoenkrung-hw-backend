const socket = io.connect('http://localhost:5050');

Vue.component('kanban-list', {
   props: {
       list: Array,
       collectionIndex: Number
   },
    data: () => {
      return {
          newTask: ''
      }
    },
    template: `
    <b-list-group >
        <b-list-group-item class="" v-for="(task, index) in list" :key="index">{{ task.name }}</b-list-group-item>
        <b-form @submit="handleNewTask">
            <b-form-input  
                id="task"
                v-model="newTask"
                type="text"
                required
            ></b-form-input>
        </b-form>
    </b-list-group>
    `,
    methods: {
        handleNewTask(e) {
            e.preventDefault();
            let task = {collectionIndex: this.collectionIndex, name: this.newTask, description: ''};
            this.$emit("addTask", task);
            this.newTask = "";
       }
    }
});

Vue.component('kanban-collection', {
    props: {
        collection: Array,
    },
    template: `
    <b-card-group 
        deck 
        style="max-width: 20rem;"
        border-variant="primary"
        header="Primary"
        header-bg-variant="primary"
        header-text-variant="white"
        align="center">
        <b-card v-for="(item, index) in collection" :key="index">
            <template v-slot:header>
                <h4 class="mb-0">{{ item.name }}</h4>
            </template>
            <kanban-list :list="item.list" :collectionIndex="index" @addTask="addTask"></kanban-list>
        </b-card>
    </b-card-group>
    `,
    methods: {
        addTask(task) {
            // let { name, description, collectionIndex } = task;
            // this.collection[collectionIndex].list.push({name: name, description: description});
            socket.emit('task', {task});
        }
    }
});

const app = new Vue({
   el: '#app',
   data: () => {
       return {
           collection: [{name: "Todo", list: [{name: "Hello 1", description: "Lorem 50"},{name: "Hello 2", description: "Lorem 50"},{name: "Hello 3", description: "Lorem 50"}]}]
       }
   },
    created() {
       socket.on('collection', data => {
           this.collection.push(data);
       });
       socket.on('task', task => {
           let { name, description, collectionIndex } = task.task;
           this.collection[collectionIndex].list.push({name: name, description: description});
       });
    }
});
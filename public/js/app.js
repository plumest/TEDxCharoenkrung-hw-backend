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
        collection: Array
    },
    data: () => {
        return { newCollection: '' }
    },
    template: `
    <b-card-group 
        deck 
        border-variant="primary"
        header="Primary"
        header-bg-variant="primary"
        header-text-variant="white"
        align="center">
        <b-card v-for="(item, index) in collection" :key="index" style="max-width: 20rem;">
            <template v-slot:header>
                <h4 class="mb-0">{{ item.name }}</h4>
            </template>
            <kanban-list :list="item.list" :collectionIndex="index" @addTask="addTask"></kanban-list>
        </b-card>
        <b-card style="max-width: 20rem;">
            <b-form @submit="handleNewCollection">
                <b-form-input  
                    id="collection"
                    v-model="newCollection"
                    type="text"
                    required
                ></b-form-input>
            </b-form>
        </b-card>
    </b-card-group>
    `,
    methods: {
        addTask(task) {
            socket.emit('task', {task});
        },
        handleNewCollection(e) {
            e.preventDefault();
            console.log(this.newCollection);
            let collection = {name: this.newCollection, list: []};
            console.log(JSON.stringify(collection));
            socket.emit('collection', {collection});
            this.newCollection = "";
        }
    }
});

const app = new Vue({
   el: '#app',
   data: () => {
       return {
           collection: [
               {name: "Todo 1", list: [{name: "Hello 1", description: "Lorem 50"},{name: "Hello 2", description: "Lorem 50"},{name: "Hello 3", description: "Lorem 50"}]},
               {name: "Todo 2", list: [{name: "Hello 1", description: "Lorem 50"},{name: "Hello 2", description: "Lorem 50"},{name: "Hello 3", description: "Lorem 50"}]}
               ]
       }
   },
    created() {
       socket.on('collection', data => {
           this.collection.push(data.collection);
           console.log(JSON.stringify(this.collection));
       });
       socket.on('task', task => {
           let { name, description, collectionIndex } = task.task;
           this.collection[collectionIndex].list.push({name: name, description: description});
       });
    }
});
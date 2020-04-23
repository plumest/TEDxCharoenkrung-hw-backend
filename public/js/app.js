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
    <div>
        <draggable v-model="list" v-bind="dragOptions" :move="onMove" @end="onEnd" @add="onAdd">
            <transition-group name="no" tag="b-list-group"> 
                <b-list-group-item class="" v-for="(task, index) in list" :key="index">{{ task.name }}</b-list-group-item>
            </transition-group>
        </draggable>
        <b-form @submit="handleNewTask">
            <b-form-input  
                id="task"
                v-model="newTask"
                type="text"
                required
            ></b-form-input>
        </b-form>
    </div>
    `,
    methods: {
        handleNewTask(e) {
            e.preventDefault();
            let task = {collectionIndex: this.collectionIndex, name: this.newTask, description: ''};
            this.$emit("addTask", task);
            this.newTask = "";
       },
        onMove({ relatedContext, draggedContext }) {
            const relatedElement = relatedContext.element;
            const draggedElement = draggedContext.element;
            console.log("ON relatedElement!!!", relatedContext.component);
            return (
                (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
            );
        },
        onEnd() {
            let data = {list: [...this.list], collectionIndex: this.collectionIndex};
            this.$emit("moveTask", data);
        },
        onAdd() {
            let data = {list: [...this.list], collectionIndex: this.collectionIndex};
            this.$emit("moveTask", data);
        }
    },
    computed: {
        dragOptions() {
            return {
                animation: 0,
                group: "description",
                ghostClass: "ghost"
            };
        },
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
            <kanban-list :list="item.list" :collectionIndex="index" @addTask="addTask" @moveTask="moveTask"></kanban-list>
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
            socket.emit('task', task);
        },

        handleNewCollection(e) {
            e.preventDefault();
            let collection = {name: this.newCollection, list: []};
            socket.emit('collection', collection);
            this.newCollection = "";
        },

        moveTask(data) {
            let { collectionIndex, list } = data;
            let collection = this.collection;
            collection.map((item, index) => {
               if (index === collectionIndex) {
                   item.list = list;
               }
            });
            socket.emit('drag', collection);
        }
    }
});

const app = new Vue({
   el: '#app',
   data: () => {
       return {
           collection: [
               {name: "Todo 1", list: [{name: "Hello 1", description: "Lorem 50"},{name: "Hello 2", description: "Lorem 50"},{name: "Hello 3", description: "Lorem 50"}]},
               {name: "Todo 2", list: [{name: "Hello 4", description: "Lorem 50"},{name: "Hello 5", description: "Lorem 50"},{name: "Hello 6", description: "Lorem 50"}]}
               ]
       }
   },
    created() {
       socket.on('collection', data => {
           this.collection.push(data);
       });

       socket.on('task', task => {
           let { name, description, collectionIndex } = task;
           this.collection[collectionIndex].list.push({name: name, description: description});
       });

        socket.on('drag', collection => {
            this.collection = collection;
        });
    }
});
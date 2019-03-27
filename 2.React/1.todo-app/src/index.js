import React from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";

import "./styles.css";

const Active = styled.div`
  font-weight: bold;
`;

const Done = styled.div`
  text-decoration: line-through;
`;

const Total = styled.div`
  padding-top: 10px;
`;

class Tasks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: this.props.tasks.filter(task => !task.done),
      completed: this.props.tasks.filter(task => task.done),
      total: this.props.tasks.length
    };

    this.addTask = this.addTask.bind(this)
  }

  addTask() {
    this.props.tasks.push({ title: 'new task', done: false });
    this.state = {
      active: this.props.tasks.filter(task => !task.done),
      completed: this.props.tasks.filter(task => task.done),
      total: this.props.tasks.length
    };
    this.forceUpdate();
  }

  render() {
    return (
      <div>
        <button onClick={this.addTask}>Add Task</button>
        {this.state.active.map(task => <Active onClick={() => {
          this.setState({ completed: this.state.completed.concat(task) })
        }}>{task.title}</Active>)}
        {this.state.completed.map(task => <Done>{task.title}</Done>)}
        <Total>Total tasks: {this.state.total}</Total>
      </div>
    );
  }
}

function App() {
  const someTasks = [
    { title: "Wash dishes", done: false },
    { title: "Read book", done: false },
    { title: "Get some sleep", done: true }
  ];
  return <Tasks tasks={someTasks} />;
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

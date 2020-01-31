import React, {Component} from 'react';

export default class Panel extends Component {

    render() {
        const {label, value, onSelect} = this.props;
        return (
            <section className="dasboard__panel" onClick={onSelect}>
                <h1 className="dashboard__panel-header">{label}</h1>
                <p className="dashboard__panel-value">{value}</p>
            </section>
        )
    }
}
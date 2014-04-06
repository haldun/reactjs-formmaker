/**
  * @jsx React.DOM
  */

var Editor = React.createClass({
  getInitialState: function() {
    return {
      form: this.props.form,
      selectedComponent: null,
      sidebarSelectedTab: 0,
      selectedField: null
    };
  },

  render: function() {
    return (
      <div className="editor row">
        <div className="col-xs-5">
          <Sidebar
              form={this.state.form}
              selectedTab={this.state.sidebarSelectedTab}
              onCatalogFieldClick={this.onCatalogFieldClick}
              onFormSettingsUpdated={this.onFormSettingsUpdated}
              field={this.state.selectedField}
              onFieldUpdate={this.onFieldUpdate} />
        </div>
        <div className="col-xs-7">
          <FormDescription
               form={this.state.form}
               onClick={this.onFormDescriptionClick}
               isSelected={this.state.selectedComponent == 'FormDescription'} />
          <FormPreview
               form={this.state.form}
               onFieldSelected={this.onFieldSelected} />
        </div>
      </div>
    );
  },

  onFormDescriptionClick: function() {
    this.setState({ selectedComponent: 'FormDescription' });
  },

  onCatalogFieldClick: function(catalogField) {
    var field = {type: catalogField.type, label: catalogField.defaultProperties.label};
    var newState = React.addons.update(this.state, {
      form: { fields: {$push: [field]}}
    });
    this.setState(newState);
  },

  onFormSettingsUpdated: function(newFormSettings) {
    var newState = React.addons.update(this.state, {
      form: {$merge: newFormSettings}
    });
    this.setState(newState);
  },

  onFieldSelected: function(fieldIndex) {
    var selectedField = this.state.form.fields[fieldIndex];
    this.setState(React.addons.update(this.state, {
      sidebarSelectedTab: {$set: 1},
      selectedField: {$set: selectedField}
    }));
  },

  onFieldUpdate: function(newProperties) {
    // var selectedField = this.state.form.fields[fieldIndex];
    // for (var property in newProperties) {
    //   selectedField[property] = newProperties[property];
    // }
  }
});

var Sidebar = React.createClass({
  tabs: [
    {title: "Add a Field"},
    {title: "Field Settings"},
    {title: "Form Settings"}
  ],

  getInitialState: function() {
    return {
      selectedTab: this.props.selectedTab !== undefined ? this.props.selectedTab : 0
    };
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      selectedTab: nextProps.selectedTab
    });
  },

  render: function() {
    var activeTab = this._getComponentForTab(this.state.selectedTab);
    var tabButtons = this.tabs.map(function(tab, i) {
      var buttonClasses = React.addons.classSet({
        'btn btn-default': true,
        'active': this.state.selectedTab === i
      });
      return (
        <button type="button" className={buttonClasses}
                key={i}
                onClick={this.onButtonClick.bind(this, i)}>{tab.title}</button>
      );
    }.bind(this));

    return (
      <div>
        <div className="btn-group">
          {tabButtons}
        </div>
        <br/><br/>
        <div>
          {activeTab}
        </div>
      </div>
    );
  },

  onButtonClick: function(i) {
    this.setState({ selectedTab: i });
  },

  _getComponentForTab: function(tab) {
    switch (tab) {
      case 0: return <FieldCatalogPane onItemClick={this.onCatalogFieldClick} />;
      case 1: return <FieldSettings field={this.props.field} onFieldUpdate={this.props.onFieldUpdate} />;
      case 2: return <FormSettings form={this.props.form}
                                   onFormSettingsUpdated={this.props.onFormSettingsUpdated}
                                    />;
    }
  },

  onCatalogFieldClick: function(catalogItem) {
    this.props.onCatalogFieldClick(catalogItem);
  }
});

var FormDescription = React.createClass({
  getDefaultProps: function() {
    return {
      selected: false
    };
  },

  render: function() {
    var classNames = React.addons.classSet({
      'panel': true,
      'panel-default': true,
      'panel-success': this.props.isSelected
    });

    return (
      <div className={classNames} onClick={this.props.onClick}>
        <div className="panel-heading">
          <h3 className="panel-title">{this.props.form.name}</h3>
        </div>
        <div className="panel-body">
          {this.props.form.description}
        </div>
      </div>
    );
  }
});

var FormPreview = React.createClass({
  render: function() {
    var hasFields = this.props.form.fields.length > 0;

    if (!hasFields) {
      return (
        <div className="alert alert-warning">
          <p><b>Hey, there is no fields!</b> Currently, you do not have any fields.</p>
          <p><button className="btn btn-default btn-sm">Create a field for me</button></p>
        </div>
      );
    }

    var fieldPreviews = this.props.form.fields.map(function(field, index) {
      return (
        <div onClick={this.onFieldClick.bind(this, index)} key={index}>
          {this.previewComponentForField(field)}
        </div>
      );
    }.bind(this));

    return (
      <div>
        {fieldPreviews}
      </div>
    );
  },

  previewComponentForField: function(field) {
    switch (field.type) {
    case 'TextField': return <TextFieldPreview field={field} />;
    case 'TextareaField': return <TextareaFieldPreview field={field} />;
    case 'NumberField': return <NumberFieldPreview field={field} />;
    case 'CheckboxField': return <CheckboxFieldPreview field={field} />;
    case 'RadioField': return <RadioFieldPreview field={field} />;
    case 'SelectField': return <SelectFieldPreview field={field} />;
    }

    throw "unknown field type: " + field.type;
  },

  onFieldClick: function(fieldIndex) {
    this.props.onFieldSelected(fieldIndex);
  }
});

var FieldCatalog = {
  items: [
    {
      label: 'Single Line Text', type: 'TextField',
      defaultProperties: {
        label: 'Untitled'
      }
    },
    { label: 'Paragraph Text', type: 'TextareaField',
      defaultProperties: {
        label: 'Untitled'
      }
    },
    { label: 'Number', type: 'NumberField',
      defaultProperties: {
        label: 'Untitled'
      }
    },
    { label: 'Checkboxes', type: 'CheckboxField',
      defaultProperties: {
        label: 'Untitled'
      }
    },
    { label: 'Multiple Choice', type: 'RadioField',
      defaultProperties: {
        label: 'Untitled'
      }
    },
    { label: 'Drop Down', type: 'SelectField',
      defaultProperties: {
        label: 'Untitled'
      }
    }
  ],

  getItemByType: function(type) {
    for (var i = 0; i < this.items.length; ++i) {
      if (this.items[i].type === type) {
        return this.items[i];
      }
    }
    return undefined;
  }
};

var FieldCatalogPane = React.createClass({
  render: function() {
    var buttons = FieldCatalog.items.map(function(item, i) {
      return (
        <button className="btn btn-default btn-block"
                key={i}
                onClick={this.onItemClick.bind(this, i)}>{item.label}</button>
      );
    }.bind(this));

    return (
      <div className="panel">
        {buttons}
      </div>
    );
  },

  onItemClick: function(index) {
    this.props.onItemClick(FieldCatalog.items[index]);
  }
});

var FieldSettings = React.createClass({
  render: function() {
    if (!this.props.field) {
      return (
        <div>Select a field</div>
      );
    }

    return (
      <div>
        {this.settingsComponentForField(this.props.field)}
      </div>
    );
  },

  settingsComponentForField: function(field) {
    switch (field.type) {
    case 'TextField': return <TextFieldSettings field={field} onFieldUpdate={this.handleFieldUpdate} />;
    case 'TextareaField': return <TextareaFieldSettings field={field} onFieldUpdate={this.handleFieldUpdate} />;
    case 'NumberField': return <NumberFieldSettings field={field} onFieldUpdate={this.handleFieldUpdate} />;
    case 'CheckboxField': return <CheckboxFieldSettings field={field} onFieldUpdate={this.handleFieldUpdate} />;
    case 'RadioField': return <RadioFieldSettings field={field} onFieldUpdate={this.handleFieldUpdate} />;
    case 'SelectField': return <SelectFieldSettings field={field} onFieldUpdate={this.handleFieldUpdate} />;
    }
    throw "unknown field type: " + field.type;
  },

  handleFieldUpdate: function(field) {
    this.props.onFieldUpdate(field);
  }
});

var FormSettings = React.createClass({
  getInitialState: function() {
    return ({
      form: this.props.form
    });
  },

  render: function() {
    return (
      <div>
        <input type="text" className="form-group" defaultValue={this.state.form.name} onChange={this.handleChange}
               ref="name" />
      </div>
    );
  },

  handleChange: function() {
    var newSettings = {
      name: this.refs.name.getDOMNode().value
    };
    this.props.onFormSettingsUpdated(newSettings);
  }
});

var TextFieldPreview = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var TextareaFieldPreview = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var NumberFieldPreview = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var CheckboxFieldPreview = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var RadioFieldPreview = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var SelectFieldPreview = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var BaseFieldSettings = {
  commonSettings: function() {
    return (
      <div>
        <div className="form-group">
          <label>Title</label>
          <textarea className="form-control"
                    defaultValue={this.props.field.label}
                    onChange={this.handleChange}
                    ref="label" />
        </div>
        <div className="form-group">
          <label>Required?</label>
          <input type="checkbox"
                 className="form-control"
                 onChange={this.handleChange}
                 ref="required" />
        </div>
        <div className="form-group">
          <label>Instructions</label>
          <textarea className="form-control" onChange={this.handleChange} ref="instructions" />
        </div>
      </div>
    );
  },

  commonSettingsValues: function() {
    return {
      label: this.refs.label.getDOMNode().value,
      required: this.refs.required.getDOMNode().checked,
      instructions: this.refs.instructions.getDOMNode().value
    };
  }
};

var TextFieldSettings = React.createClass({
  mixins: [BaseFieldSettings],

  render: function() {
    return this.commonSettings();
  },

  handleChange: function() {
    this.props.onFieldUpdate(this.commonSettingsValues());
  }
});

var TextareaFieldSettings = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var NumberFieldSettings = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var CheckboxFieldSettings = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var RadioFieldSettings = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});

var SelectFieldSettings = React.createClass({
  render: function() {
    return (
      <div className="form-group">
        <label>{this.props.field.label}</label>
        <input type="text" className="form-control" />
      </div>
    );
  }
});
var form = {
  name: "My First form",
  description: "Description goes here",
  fields: [
    {"type":"TextField","label":"Untitled","required":false,"helpText":""}
  ]
};

React.renderComponent(
  <Editor form={form} />,
  document.getElementById('editorContainer')
);

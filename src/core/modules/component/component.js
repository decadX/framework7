import Framework7Component from './component-class';
import parseComponent from './parse-component';

export default {
  name: 'component',
  create() {
    const app = this;
    app.customComponents = app.constructor.customComponents;
    app.component = {
      parse(componentString) {
        return parseComponent(componentString);
      },
      create(options, extendContext, children) {
        return new Framework7Component(app, options, extendContext, children);
      },
      init(el) {
        return new Promise((resolve, reject) => {
          if (!el || !el.nodeName) {
            reject();
            return;
          }
          const tag = el.nodeName.toLowerCase();
          if (!app.customComponents[tag]) {
            reject();
            return;
          }
          const props = {};
          for (let i = 0; i < el.attributes.length; i += 1) {
            const attrName = el.attributes[i].name;
            let attrValue = el.attributes[i].value;
            if (attrValue === 'null') attrValue = null;
            if (attrValue === 'undefined') attrValue = undefined;
            props[attrName] = attrValue;
          }
          app.component.create(Object.assign({ el }, app.customComponents[tag]), props, el.children)
            .then((c) => {
              resolve(c);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
    };
  },
  static: {
    customComponents: {},
    registerComponent(tagName, component) {
      this.customComponents[tagName] = component;
    },
  },
  on: {
    pageInit(page) {
      const app = this;
      const tags = Object.keys(app.constructor.customComponents);
      tags.forEach((tagName) => {
        page.$el.find(tagName).each((index, tagEl) => {
          app.component.init(tagEl);
        });
      });
    },
  },
};

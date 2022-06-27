import {
  ASTPath,
  CallExpression,
  Expression,
  Node,
  Transform,
} from "jscodeshift";

type ConnectedReferences = {
  [component: string]: {
    params: any;
    props: {
      [key: string]: any;
    };
  };
};

type ComponentProps = ConnectedReferences["SomeComponent"]["props"];

const transformModule: Transform = function (fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  const connectedReferences: ConnectedReferences = {};

  function getConnectProps(path: ASTPath<CallExpression>): any {
    const arg = path.value.arguments[0];

    if (arg.type === "ArrowFunctionExpression") {
      const body = arg.body as any;
      const props: ComponentProps = {};

      body.properties.forEach((prop: any) => {
        const propName = prop.key.name;
        props[propName] = prop.value;
      });
    }
  }

  function getComponentName(path: ASTPath<CallExpression>) {
    const isIdentifier =
      path.parentPath.value.arguments?.[0].type === "Identifier";

    if (isIdentifier) {
      return path.parentPath.value.arguments[0].name as string;
    }
    return "";
  }

  function getConnectReferences() {
    const items = root
      .find(j.CallExpression, {
        callee: {
          name: "connect",
        },
      })
      .forEach((path) => {
        const componentName = getComponentName(path);
        connectedReferences[componentName] = getConnectProps(path);
      });

    console.log(items);
  }

  const connectReferences = getConnectReferences();
  console.log(connectReferences);
};

export default transformModule;

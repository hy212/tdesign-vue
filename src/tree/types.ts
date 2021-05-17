import TreeNode from '../../common/js/tree/tree-node';

import {
  TdTreeProps,
  TreeNodeModel,
  TreeInstanceFunctions,
  TreeNodeValue as TdTreeNodeValue,
  TreeNodeState as TdTreeNodeState,
} from '../../types/tree/TdTreeProps';

import {
  TypeTreeEventState,
} from '../../common/js/tree/types';

export type TreeNodeState = TdTreeNodeState;

export type TreeNodeValue = TdTreeNodeValue;

export type TypeValueMode = TdTreeProps['valueMode'];

export type TypeTNodeProp = string | TNode;

export type TypeTreeNodeModel = TreeNodeModel<TreeOptionData>;

export type TypeTargetNode = TdTreeNodeValue | TreeNode | TypeTreeNodeModel;

export interface TypeEventState extends TypeTreeEventState {
  mouseEvent?: MouseEvent;
  event?: Event;
  path?: TreeNode[];
};

export interface TypeContext {
  node?: TypeTreeNodeModel;
  e?: MouseEvent;
};

export interface TypeMark {
  name: string;
  value: string;
  el?: HTMLElement;
}

export interface TypeLineModel {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

export interface TypeTreeInstance extends Vue, TreeInstanceFunctions {};

export interface TypeGetTNodeOption {
  node?: TreeNode;
  createElement?: Vue.CreateElement;
}

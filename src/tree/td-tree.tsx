import Vue, { VNode, VueConstructor, CreateElement } from 'vue';
import upperFirst from 'lodash/upperFirst';
import TreeStore from '../../common/js/tree/tree-store';
import TreeNode from '../../common/js/tree/tree-node';
import TreeItem from './tree-item';
import props from '../../types/tree/props';
import {
  TreeNodeValue,
  TypeValueMode,
  TypeEventState,
  TypeContext,
  TreeNodeState,
  TypeTreeNodeModel,
  TypeTreeInstance,
  TypeTargetNode,
} from './types';
import {
  TREE_NAME,
  CLASS_NAMES,
  FX,
} from './constants';
import {
  getMark,
  getTNode,
  getNode,
  callEmit,
} from './util';

export default (Vue as VueConstructor<TypeTreeInstance>).extend({
  name: TREE_NAME,
  model: {
    prop: 'value',
    event: 'change',
  },
  props,
  data() {
    const {
      checkProps,
      empty,
      icon,
      label,
      line,
      operations,
    } = this;

    return {
      store: null,
      nodesMap: null,
      mouseEvent: null,
      treeNodes: [],
      treeScope: {
        checkProps,
        empty,
        icon,
        label,
        line,
        operations,
        scopedSlots: null,
      },
      transitionCD: null,
    };
  },
  computed: {
    classList(): ClassName {
      const list: Array<string> = [CLASS_NAMES.tree];
      const {
        disabled,
        hover,
        transition,
      } = this;
      if (disabled) {
        list.push(CLASS_NAMES.disabled);
      }
      if (hover) {
        list.push(CLASS_NAMES.treeHoverable);
      }
      if (transition) {
        list.push(CLASS_NAMES.treeFx);
      }
      return list;
    },
  },
  watch: {
    data(list) {
      this.store.removeAll();
      this.store.append(list);
    },
    keys(nKeys) {
      this.store.setConfig({
        keys: nKeys,
      });
    },
    value(nVal) {
      this.store.replaceChecked(nVal);
    },
    expanded(nVal) {
      this.store.replaceExpanded(nVal);
    },
    expandAll(isExpandAll) {
      this.store.setConfig({
        expandAll: isExpandAll,
      });
    },
    expandLevel(nExpandLevel) {
      this.store.setConfig({
        expandLevel: nExpandLevel,
      });
    },
    expandMutex(nExpandMutex) {
      this.store.setConfig({
        expandMutex: nExpandMutex,
      });
    },
    expandParent(isExpandParent) {
      this.store.setConfig({
        expandParent: isExpandParent,
      });
    },
    activable(isActivable) {
      this.store.setConfig({
        activable: isActivable,
      });
    },
    activeMultiple(isActiveMultiple) {
      this.store.setConfig({
        activeMultiple: isActiveMultiple,
      });
    },
    actived(nVal) {
      this.store.replaceActived(nVal);
    },
    disabled(isDisabled) {
      this.store.setConfig({
        disabled: isDisabled,
      });
    },
    checkable(isCheckAble) {
      this.store.setConfig({
        checkable: isCheckAble,
      });
    },
    checkStrictly(isCheckStrictly) {
      this.store.setConfig({
        checkStrictly: isCheckStrictly,
      });
    },
    load(fn) {
      this.store.setConfig({
        load: fn,
      });
    },
    lazy(isLazy) {
      this.store.setConfig({
        lazy: isLazy,
      });
    },
    valueMode(nMode) {
      this.store.setConfig({
        valueMode: nMode,
      });
    },
    filter(fn) {
      const { store } = this;
      store.setConfig({
        filter: fn,
      });
      store.updateAll();
    },
    checkProps(props) {
      this.treeScope.checkProps = props;
    },
    empty(tnode) {
      this.treeScope.empty = tnode;
    },
    icon(tnode) {
      this.treeScope.icon = tnode;
    },
    label(tnode) {
      this.treeScope.label = tnode;
    },
    line(tnode) {
      this.treeScope.line = tnode;
    },
    operations(tnode) {
      this.treeScope.operations = tnode;
    },
  },
  methods: {
    // 创建单个 tree 节点
    renderItem(node: TreeNode) {
      const { treeScope } = this;
      const treeItem = (
        <TreeItem
          key={node.value}
          node={node}
          treeScope={treeScope}
          onClick={this.handleClick}
          onChange={this.handleChange}
        />
      );
      return treeItem;
    },
    // 获取视图节点映射关系
    getNodesMap() {
      let { nodesMap } = this;
      if (!nodesMap) {
        nodesMap = new Map();
        this.nodesMap = nodesMap;
      }
      return nodesMap;
    },
    // 更新视图节点映射关系
    updateNodesMap() {
      const { store, treeNodes } = this;
      const nodesMap = this.getNodesMap();

      let index = 0;
      while (index < treeNodes.length) {
        const nodeView = treeNodes[index];
        if (nodeView && nodeView.componentInstance) {
          const { node } = nodeView.componentInstance;
          if (node && !store.getNode(node)) {
            // 视图列表中的节点，在树中不存在
            const nodeViewIndex = treeNodes.indexOf(nodeView);
            treeNodes.splice(nodeViewIndex, 1);
            nodeView.componentInstance.$destroy();
            nodesMap.delete(node.value);
          } else {
            index += 1;
          }
        } else {
          index += 1;
        }
      }
    },
    // 刷新树的视图状态
    refresh() {
      const {
        store,
        treeNodes,
        treeScope,
        $scopedSlots: scopedSlots,
      } = this;

      treeScope.scopedSlots = scopedSlots;

      const nodesMap = this.getNodesMap();
      this.updateNodesMap();

      let index = 0;
      const allNodes = store.getNodes();
      allNodes.forEach((node: TreeNode) => {
        if (node.visible) {
          if (nodesMap.has(node.value)) {
            const nodeView = nodesMap.get(node.value);
            const nodeViewIndex = treeNodes.indexOf(nodeView);
            if (nodeViewIndex !== index) {
              // 节点存在，但位置与可视节点位置冲突，需要更新节点位置
              treeNodes.splice(nodeViewIndex, 1);
              treeNodes.splice(index, 0, nodeView);
            }
          } else {
            // 节点可视，且不存在视图，创建该节点视图并插入到当前位置
            const nodeView = this.renderItem(node);
            treeNodes.splice(index, 0, nodeView);
            nodesMap.set(node.value, nodeView);
          }
          index += 1;
        } else {
          if (nodesMap.has(node.value)) {
            // 节点不可视，存在该视图，需要删除该节点视图
            const nodeView = nodesMap.get(node.value);
            const nodeViewIndex = treeNodes.indexOf(nodeView);
            treeNodes.splice(nodeViewIndex, 1);
            nodesMap.delete(node.value);
            nodeView.componentInstance.$destroy();
          }
        }
      });
    },
    // 初始化树结构
    build() {
      const list = this.data;
      const {
        activable,
        activeMultiple,
        checkable,
        checkStrictly,
        expanded,
        expandAll,
        expandLevel,
        expandMutex,
        expandParent,
        actived,
        disabled,
        load,
        lazy,
        value,
        valueMode,
        filter,
      } = this;

      if (list && list.length > 0) {
        const store = new TreeStore({
          keys: this.keys,
          activable,
          activeMultiple,
          checkable,
          checkStrictly,
          expandAll,
          expandLevel,
          expandMutex,
          expandParent,
          disabled,
          load,
          lazy,
          valueMode: valueMode as TypeValueMode,
          filter,
          onLoad: (info: TypeEventState) => {
            this.handleLoad(info);
          },
          onUpdate: () => {
            this.refresh();
          },
        });

        // 初始化数据
        this.store = store;
        store.append(list);

        // 初始化选中状态
        if (Array.isArray(value)) {
          store.setChecked(value);
        }

        // 初始化展开状态
        if (Array.isArray(expanded)) {
          const expandedMap = new Map();
          expanded.forEach((val) => {
            expandedMap.set(val, true);
            if (expandParent) {
              const node = store.getNode(val);
              node.getParents().forEach((tn) => {
                expandedMap.set(tn.value, true);
              });
            }
          });
          const expandedArr = Array.from(expandedMap.keys());
          store.setExpanded(expandedArr);
        }

        // 初始化激活状态
        if (Array.isArray(actived)) {
          store.setActived(actived);
        }

        // 树的数据初始化之后，需要立即进行一次视图刷新
        store.refreshNodes();
        this.refresh();
      }
    },
    toggleActived(item: TypeTargetNode): TreeNodeValue[] {
      const node = getNode(this.store, item);
      return this.setActived(node, !node.isActived());
    },
    setActived(item: TypeTargetNode, isActived: boolean) {
      const node = getNode(this.store, item);
      const actived = node.setActived(isActived);
      const { mouseEvent } = this;
      const ctx: TypeContext = {
        node: node.getModel(),
        e: mouseEvent,
      };
      callEmit(this, 'active', [actived, ctx]);
      return actived;
    },
    toggleExpanded(item: TypeTargetNode): TreeNodeValue[] {
      const node = getNode(this.store, item);
      return this.setExpanded(node, !node.isExpanded());
    },
    setExpanded(item: TypeTargetNode, isExpanded: boolean): TreeNodeValue[] {
      const node = getNode(this.store, item);
      const expanded = node.setExpanded(isExpanded);
      const { mouseEvent } = this;
      const ctx: TypeContext = {
        node: node.getModel(),
        e: mouseEvent,
      };
      callEmit(this, 'expand', [expanded, ctx]);
      return expanded;
    },
    toggleChecked(item: TypeTargetNode): TreeNodeValue[] {
      const node = getNode(this.store, item);
      return this.setChecked(node, !node.isChecked());
    },
    setChecked(item: TypeTargetNode, isChecked: boolean): TreeNodeValue[] {
      const node = getNode(this.store, item);
      const checked = node.setChecked(isChecked);
      const ctx: TypeContext = {
        node: node.getModel(),
      };
      callEmit(this, 'change', [checked, ctx]);
      return checked;
    },
    handleLoad(info: TypeEventState): void {
      const { node } = info;
      const ctx: TypeContext = {
        node: node.getModel(),
      };
      callEmit(this, 'load', [ctx]);
    },
    handleClick(state: TypeEventState): void {
      const { expandOnClickNode } = this;
      const {
        mouseEvent,
        event,
        node,
      } = state;

      if (!node || this.disabled || node.disabled) {
        return;
      }

      this.mouseEvent = mouseEvent;

      let shouldExpand = expandOnClickNode;
      let shouldActive = true;
      ['trigger', 'ignore'].forEach((markName) => {
        const mark = getMark(
          markName,
          event.target as HTMLElement,
          event.currentTarget as HTMLElement
        );
        const markValue = mark?.value || '';
        if (markValue.indexOf('expand') >= 0) {
          if (markName === 'trigger') {
            shouldExpand = true;
          } else if (markName === 'ignore') {
            shouldExpand = false;
          }
        }
        if (markValue.indexOf('active') >= 0) {
          if (markName === 'ignore') {
            shouldActive = false;
          }
        }
      });

      if (shouldExpand) {
        this.toggleExpanded(node);
      }
      if (shouldActive) {
        this.toggleActived(node);
      }

      const ctx: TypeContext = {
        node: node.getModel(),
        e: mouseEvent,
      };

      callEmit(this, 'click', [ctx]);
      this.mouseEvent = null;
    },
    handleChange(state: TypeEventState): void {
      const { disabled } = this;
      const { node } = state;
      if (!node || disabled || node.disabled) {
        return;
      }
      this.toggleChecked(node);
    },

    // -------- 公共方法 start --------
    setItem(value: TreeNodeValue, options: TreeNodeState): void {
      const node: TreeNode = this.store.getNode(value);
      const spec = options;
      const keys = Object.keys(spec);
      if (node && spec) {
        ['expanded', 'actived', 'checked'].forEach((name) => {
          if (keys.includes(name)) {
            this[`set${upperFirst(name)}`](node, spec[name]);
            delete spec[name];
          }
        });
        node.set(spec);
      }
    },
    getItem(value: TreeNodeValue): TypeTreeNodeModel {
      const node: TreeNode = this.store.getNode(value);
      return node?.getModel();
    },
    getItems(value?: TreeNodeValue): TypeTreeNodeModel[] {
      const nodes = this.store.getNodes(value);
      return nodes.map((node: TreeNode) => node.getModel());
    },
    appendTo(para?: TreeNodeValue, item?: TreeOptionData | TreeOptionData[]): void {
      let list = [];
      if (Array.isArray(item)) {
        list = item;
      } else {
        list = [item];
      }
      list.forEach((item) => {
        const val = item?.value || '';
        const node = getNode(this.store, val);
        if (node) {
          this.store.appendNodes(para, node);
        } else {
          this.store.appendNodes(para, item);
        }
      });
    },
    insertBefore(value: TreeNodeValue, item: TreeOptionData): void {
      const val = item?.value || '';
      const node = getNode(this.store, val);
      if (node) {
        this.store.insertBefore(value, node);
      } else {
        this.store.insertBefore(value, item);
      }
    },
    insertAfter(value: TreeNodeValue, item: TreeOptionData): void {
      const val = item?.value || '';
      const node = getNode(this.store, val);
      if (node) {
        this.store.insertAfter(value, node);
      } else {
        this.store.insertAfter(value, item);
      }
    },
    remove(value?: TreeNodeValue): void {
      return this.store.remove(value);
    },
    getIndex(value: TreeNodeValue): number {
      return this.store.getNodeIndex(value);
    },
    getParent(value: TreeNodeValue): TypeTreeNodeModel {
      const node = this.store.getParent(value);
      return node?.getModel();
    },
    getParents(value: TreeNodeValue): TypeTreeNodeModel[] {
      const nodes = this.store.getParents(value);
      return nodes.map((node: TreeNode) => node.getModel());
    },
    getPath(value: TreeNodeValue): TypeTreeNodeModel[] {
      const node = this.store.getNode(value);
      let pathNodes = [];
      if (node) {
        pathNodes = node.getPath()
          .map((node: TreeNode) => node.getModel());
      }
      return pathNodes;
    },
    // -------- 公共方法 end --------
  },
  created() {
    this.build();
  },
  render(createElement: CreateElement): VNode {
    const {
      classList,
      treeNodes,
      $scopedSlots,
      empty,
    } = this;

    let emptyNode = null;
    let treeNodeList = null;

    if (treeNodes.length <= 0) {
      if ($scopedSlots?.empty) {
        emptyNode = $scopedSlots.empty(null);
      } else if (empty) {
        emptyNode = getTNode(empty, {
          createElement,
        });
      }
      emptyNode = (
        <div
          class={CLASS_NAMES.treeEmpty}
        >{emptyNode}</div>
      );
    } else {
      treeNodeList = (
        <transition-group
          name={FX.treeNode}
          tag="div"
          class={CLASS_NAMES.treeList}
        >{treeNodes}</transition-group>
      );
    }

    return (
      <div class={classList}>
        {treeNodeList}
        {emptyNode}
      </div>
    );
  },
});

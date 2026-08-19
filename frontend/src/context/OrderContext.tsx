/**
 * OrderContext — compatibility shim.
 * All state and actions have been consolidated into WorkflowContext.
 * This file re-exports everything so existing import paths continue to work.
 */
export {
  WorkflowProvider as OrderProvider,
  useOrders,
  useWorkflow,
} from './WorkflowContext';

export type { WorkflowContextType as OrderContextType } from './WorkflowContext';

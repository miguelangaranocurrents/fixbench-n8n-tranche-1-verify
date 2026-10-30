import { test, expect } from '../../../fixtures/base';

test.describe(
	'Execution Data Node',
	{
		annotation: [{ type: 'owner', description: 'NODES' }],
	},
	() => {
		test('should save boolean and zero values as custom data', async ({ n8n, api }) => {
			const { workflowId } = await api.workflows.createWorkflowFromDefinition({
				name: 'Execution Data',
				nodes: [
					{
						parameters: {},
						id: 'manual-trigger',
						name: 'Manual Trigger',
						type: 'n8n-nodes-base.manualTrigger',
						typeVersion: 1,
						position: [0, 0],
					},
					{
						parameters: {
							dataToSave: {
								values: [
									{ key: 'approved', value: '={{ true }}' },
									{ key: 'retries', value: '={{ 0 }}' },
								],
							},
						},
						id: 'execution-data',
						name: 'Execution Data',
						type: 'n8n-nodes-base.executionData',
						typeVersion: 1.1,
						position: [200, 0],
					},
				],
				connections: {
					'Manual Trigger': { main: [[{ node: 'Execution Data', type: 'main', index: 0 }]] },
				},
			});

			await n8n.start.fromExistingWorkflow(workflowId);
			await n8n.canvas.clickExecuteWorkflowButton();

			const execution = await api.workflows.waitForExecution(workflowId, 15000, 'manual');
			expect(execution.status).toBe('success');

			const details = await api.workflows.getExecution(execution.id);
			expect((details as { customData?: Record<string, string> }).customData).toEqual({ approved: 'true', retries: '0' });
		});
	},
);

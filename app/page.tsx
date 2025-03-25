"use client";

import { SetStateAction, useState } from "react";
import { sampleData } from "./lib/sample-data";
import BinaryTree from "./binary-tree";
import NodeDetails from "./node-details";
import { TreeNode } from "./tree-node";

export default function Home() {
	const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
	const [rootNode, setRootNode] = useState(sampleData);
	const [visibleLevels, setVisibleLevels] = useState(3);

	const handleNodeClick = (node: TreeNode) => {
		setSelectedNode(node);
	};

	const handleSetAsRoot = (node: SetStateAction<TreeNode>) => {
		setRootNode(node);
		setSelectedNode(null);
	};

	const handleNavigateUp = () => {
		if (rootNode.parent) {
			setRootNode(rootNode.parent);
			setSelectedNode(null);
		}
	};

	const handleChangeVisibleLevels = (e: { target: { value: string } }) => {
		setVisibleLevels(Number.parseInt(e.target.value));
	};

	function getMaxDepth(node: TreeNode | null): number {
		if (!node) return 0;
		return 1 + Math.max(getMaxDepth(node.left), getMaxDepth(node.right));
	}

	const maxDepth = getMaxDepth(rootNode);
	const levelOptions = Array.from({ length: maxDepth }, (_, i) => i + 1);

	return (
		<div>
			<main className="flex min-h-screen flex-col items-center p-4 md:p-8">
				<h1 className="text-2xl md:text-4xl font-bold mb-6">
					Daxcsa Genealogy Tree
				</h1>

				<div className="w-full max-w-7xl mb-6 flex flex-row justify-center md:justify-between items-center gap-4">
					<div className="flex items-center gap-2">
						<button
							onClick={handleNavigateUp}
							disabled={!rootNode.parent}
							className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:bg-blue-300"
						>
							Navigate Up
						</button>
						<span className="text-lg font-bold">
							Current Root: {rootNode.username}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<label
							htmlFor="levels"
							className="text-sm"
						>
							Visible Levels:
						</label>
						<select
							id="levels"
							value={visibleLevels}
							onChange={handleChangeVisibleLevels}
							className="px-2 py-1 border rounded-md"
						>
							{levelOptions.map((level) => (
								<option
									key={level}
									value={level}
									className="text-black"
								>
									{level}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="w-full flex flex-col lg:flex-row gap-6">
					<div className="w-full lg:w-3/4">
						<BinaryTree
							rootNode={rootNode}
							onNodeClick={handleNodeClick}
							visibleLevels={visibleLevels}
							selectedNode={selectedNode}
						/>
					</div>

					<div className="w-full items-center lg:w-1/4 ">
						{selectedNode ? (
							<NodeDetails
								node={selectedNode}
								onSetAsRoot={handleSetAsRoot}
							/>
						) : (
							<div className="p-4 border rounded-md bg-gray-100 text-black">
								<p>Select a node to view details</p>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}

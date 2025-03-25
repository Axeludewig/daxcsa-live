"use client";
import { TreeNode } from "./tree-node";

interface NodeDetailsProps {
	node: TreeNode | null;
	onSetAsRoot: (node: TreeNode) => void;
}

export default function NodeDetails({ node, onSetAsRoot }: NodeDetailsProps) {
	if (!node) return null;

	return (
		<div className="border border-gray-200 rounded-lg shadow-sm bg-white text-black">
			{/* Top section: Username + status */}
			<div className="p-6 space-y-2">
				<div className="flex items-center gap-2">
					<span className="text-xl">👤</span>
					<h3 className="text-2xl font-semibold">{node.username}</h3>
				</div>
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
						node.status === "active"
							? "bg-green-100 text-green-800"
							: "bg-red-100 text-red-800"
					}`}
				>
					{node.status}
				</span>
			</div>

			{/* Info section */}
			<div className="p-6 pt-0 space-y-4">
				<div>
					<h3 className="text-sm font-medium text-gray-700">
						Full Name
					</h3>
					<p>{node.fullName}</p>
				</div>

				<div>
					<h3 className="text-sm font-medium text-gray-700">
						Product
					</h3>
					<p>{node.product}</p>
				</div>

				<div>
					<h3 className="text-sm font-medium text-gray-700">
						Category
					</h3>
					<p>{node.category}</p>
				</div>

				<div>
					<h3 className="text-sm font-medium text-gray-700">
						Network Size
					</h3>
					<p>{node.num_children} distributors</p>
				</div>

				<div>
					<h3 className="text-sm font-medium text-gray-700 mb-2">
						Network
					</h3>
					<div className="grid grid-cols-2 gap-2">
						<div className="border border-gray-200 rounded p-2 text-center">
							<div className="text-sm font-medium text-gray-700">
								Left
							</div>
							<div>
								{node.left ? node.left.username : "Empty"}
							</div>
						</div>
						<div className="border border-gray-200 rounded p-2 text-center">
							<div className="text-sm font-medium text-gray-700">
								Right
							</div>
							<div>
								{node.right ? node.right.username : "Empty"}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Set-as-root button */}
			<div className="p-6 pt-0">
				<button
					onClick={() => onSetAsRoot(node)}
					className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:bg-blue-300 flex items-center justify-center"
					disabled={!node.left && !node.right}
				>
					<span className="mr-2">▼</span>
					Set as Root
				</button>
			</div>
		</div>
	);
}

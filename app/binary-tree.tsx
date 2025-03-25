import React, { useState, useEffect, useMemo } from "react";
import { TreeNode } from "./tree-node";

/**
 * "No Child" node for when a parent has exactly one child.
 */
const PLACEHOLDER_NODE: any = {
	username: "No Child",
	left: null,
	right: null,
};

/**
 * measurePixelWidth:
 * Returns how many actual *pixels* this subtree needs horizontally, factoring in:
 *  - nodeWidth
 *  - xSpacing
 *  - visibleLevels
 *  - placeholders if a node has exactly 1 child
 */
function measurePixelWidth(
	node: TreeNode | null,
	level: number,
	visibleLevels: number,
	nodeWidth: number,
	xSpacing: number
): number {
	if (!node || level >= visibleLevels) {
		// Past visible levels => no space
		return 0;
	}
	const canGoDeeper = level + 1 < visibleLevels;

	// figure out actual left & right children,
	// inserting placeholder if one side is missing
	let leftChild = node.left && canGoDeeper ? node.left : null;
	let rightChild = node.right && canGoDeeper ? node.right : null;

	const hasLeft = !!leftChild;
	const hasRight = !!rightChild;
	const zeroChildren = !hasLeft && !hasRight;

	// If node has exactly one child, fill the other side with a placeholder
	if (hasLeft && !hasRight) {
		rightChild = PLACEHOLDER_NODE;
	} else if (!hasLeft && hasRight) {
		leftChild = PLACEHOLDER_NODE;
	}

	// If zero children => it's a leaf => just nodeWidth
	// Or if level >= visibleLevels => 0
	if (zeroChildren) {
		return nodeWidth;
	}

	// measure each child's width
	const leftW = leftChild
		? measurePixelWidth(
				leftChild,
				level + 1,
				visibleLevels,
				nodeWidth,
				xSpacing
		  )
		: 0;
	const rightW = rightChild
		? measurePixelWidth(
				rightChild,
				level + 1,
				visibleLevels,
				nodeWidth,
				xSpacing
		  )
		: 0;

	// total subtrees + spacing if both sides exist
	const totalChildrenW =
		leftW + rightW + (leftChild && rightChild ? xSpacing : 0);

	// ensure it's at least the parent's own width
	return Math.max(totalChildrenW, nodeWidth);
}

/**
 * layoutTree:
 * Recursively compute (x, y) for each node so each subtree’s pixel width is respected,
 * inserting placeholders if one child is missing.
 */
function layoutTree(
	node: TreeNode | null,
	level: number,
	visibleLevels: number,
	topX: number,
	topY: number,
	xSpacing: number,
	ySpacing: number,
	nodeWidth: number,
	nodeHeight: number,
	parentPos: { x: number; y: number } | null
): {
	node: TreeNode;
	x: number;
	y: number;
	parentX: number | null;
	parentY: number | null;
}[] {
	if (!node || level >= visibleLevels) return [];

	// see if we can go deeper & figure out placeholders
	const canGoDeeper = level + 1 < visibleLevels;

	let leftChild = node.left && canGoDeeper ? node.left : null;
	let rightChild = node.right && canGoDeeper ? node.right : null;

	const hasLeft = !!leftChild;
	const hasRight = !!rightChild;
	const zeroChildren = !hasLeft && !hasRight;

	// Insert placeholders if exactly 1 child
	if (hasLeft && !hasRight) {
		rightChild = PLACEHOLDER_NODE;
	} else if (!hasLeft && hasRight) {
		leftChild = PLACEHOLDER_NODE;
	}

	// measure widths
	const leftW = leftChild
		? measurePixelWidth(
				leftChild,
				level + 1,
				visibleLevels,
				nodeWidth,
				xSpacing
		  )
		: 0;
	const rightW = rightChild
		? measurePixelWidth(
				rightChild,
				level + 1,
				visibleLevels,
				nodeWidth,
				xSpacing
		  )
		: 0;

	// total child width
	const totalChildWidth =
		leftW + rightW + (leftChild && rightChild ? xSpacing : 0);
	// parent's subtree width
	const subtreeWidth = Math.max(totalChildWidth, nodeWidth);

	// Node's X is topX + half the subtree width minus half nodeWidth
	const nodeX = topX + subtreeWidth / 2 - nodeWidth / 2;
	const nodeY = topY;

	const positions = [
		{
			node,
			x: nodeX,
			y: nodeY,
			parentX: parentPos?.x ?? null,
			parentY: parentPos?.y ?? null,
		},
	];

	// If zero children => a leaf => done
	if (zeroChildren) {
		return positions;
	}

	// place children if canGoDeeper
	if (canGoDeeper) {
		const childY = nodeY + nodeHeight + ySpacing;
		let cursorX = topX;

		if (leftChild) {
			positions.push(
				...layoutTree(
					leftChild,
					level + 1,
					visibleLevels,
					cursorX,
					childY,
					xSpacing,
					ySpacing,
					nodeWidth,
					nodeHeight,
					{ x: nodeX, y: nodeY }
				)
			);
			cursorX += leftW;
		}
		if (leftChild && rightChild) {
			cursorX += xSpacing;
		}
		if (rightChild) {
			positions.push(
				...layoutTree(
					rightChild,
					level + 1,
					visibleLevels,
					cursorX,
					childY,
					xSpacing,
					ySpacing,
					nodeWidth,
					nodeHeight,
					{ x: nodeX, y: nodeY }
				)
			);
		}
	}

	return positions;
}

function getBoundingBox(
	all: { x: number; y: number }[],
	nodeWidth: number,
	nodeHeight: number
) {
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity;
	for (const p of all) {
		// p.x and p.y are the top-left corner of the node
		const rightEdge = p.x + nodeWidth;
		const bottomEdge = p.y + nodeHeight;
		if (p.x < minX) minX = p.x;
		if (rightEdge > maxX) maxX = rightEdge;
		if (p.y < minY) minY = p.y;
		if (bottomEdge > maxY) maxY = bottomEdge;
	}
	return { minX, maxX, minY, maxY };
}

// Main component
export default function PerfectBinaryTree({
	rootNode,
	onNodeClick,
	visibleLevels = 3,
	nodeWidth = 180,
	nodeHeight = 80,
	xSpacing = 80,
	ySpacing = 60,
	selectedNode,
}: {
	rootNode: TreeNode | null;
	onNodeClick?: (node: TreeNode) => void;
	visibleLevels?: number;
	nodeWidth?: number;
	nodeHeight?: number;
	xSpacing?: number;
	ySpacing?: number;
	selectedNode?: TreeNode | null;
}) {
	const [positions, setPositions] = useState<
		{
			node: TreeNode;
			x: number;
			y: number;
			parentX: number | null;
			parentY: number | null;
		}[]
	>([]);

	// Zoom
	const [zoom, setZoom] = useState(1);
	const minZoom = 0.5;
	const maxZoom = 2.0;

	// Recompute layout whenever rootNode or sizing/levels change
	useEffect(() => {
		if (!rootNode) {
			setPositions([]);
			return;
		}
		const newLayout = layoutTree(
			rootNode,
			0,
			visibleLevels,
			0,
			0,
			xSpacing,
			ySpacing,
			nodeWidth,
			nodeHeight,
			null
		);
		setPositions(newLayout);
	}, [rootNode, visibleLevels, xSpacing, ySpacing, nodeWidth, nodeHeight]);

	// bounding box for all nodes
	const { minX, maxX, minY, maxY } = useMemo(() => {
		if (!positions.length) {
			return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
		}
		return getBoundingBox(positions, nodeWidth, nodeHeight);
	}, [positions, nodeWidth, nodeHeight]);

	// padding
	const pad = 50;
	const contentWidth = maxX - minX + pad * 2;
	const contentHeight = maxY - minY + pad * 2;

	// shift functions
	function shiftX(x: number) {
		return (x - minX + pad) * zoom;
	}
	function shiftY(y: number) {
		return (y - minY + pad) * zoom;
	}

	// Zoom Handlers
	const handleZoomIn = () => setZoom((z) => Math.min(maxZoom, z + 0.1));
	const handleZoomOut = () => setZoom((z) => Math.max(minZoom, z - 0.1));
	const handleZoomReset = () => setZoom(1);

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			{/* Zoom controls */}
			<div style={{ alignSelf: "center", display: "flex", gap: 8 }}>
				<button
					onClick={handleZoomOut}
					disabled={zoom <= minZoom}
					className="px-4 py-1 border rounded-sm bg-white text-black"
				>
					-
				</button>
				<button
					onClick={handleZoomReset}
					className="px-4 py-1 border rounded-sm bg-white text-black"
				>
					Reset
				</button>
				<button
					onClick={handleZoomIn}
					disabled={zoom >= maxZoom}
					className="px-4 py-1 border rounded-sm bg-white text-black"
				>
					+
				</button>
				<span>{Math.round(zoom * 100)}%</span>
			</div>

			{/* Scrollable container */}
			<div
				style={{
					position: "relative",
					width: "100%",
					maxWidth: "100%",
					height: "600px",
					border: "1px solid #ccc",
					overflow: "auto",
					background: "#f9f9f9",
				}}
			>
				{/* SVG for lines */}
				<svg
					width={contentWidth * zoom}
					height={contentHeight * zoom}
					style={{
						position: "absolute",
						left: 0,
						top: 0,
						pointerEvents: "none",
					}}
				>
					{positions.map((p, i) => {
						if (p.parentX == null || p.parentY == null) return null;
						// draw from parent's bottom-center to child's top-center
						const x1 = shiftX(p.parentX + nodeWidth / 2);
						const y1 = shiftY(p.parentY + nodeHeight);
						const x2 = shiftX(p.x + nodeWidth / 2);
						const y2 = shiftY(p.y);
						return (
							<line
								key={i}
								x1={x1}
								y1={y1}
								x2={x2}
								y2={y2}
								stroke="#444"
								strokeWidth={1.5}
							/>
						);
					})}
				</svg>

				{/* Node divs */}
				<div
					style={{
						position: "relative",
						width: contentWidth * zoom,
						height: contentHeight * zoom,
					}}
				>
					{positions.map((p, i) => {
						const left = shiftX(p.x);
						const top = shiftY(p.y);
						const isSelected =
							selectedNode && p.node === selectedNode;

						// "No Child" node
						const isPlaceholder = p.node.username === "No Child";

						return (
							<div
								key={i}
								style={{
									position: "absolute",
									left,
									top,
									width: nodeWidth * zoom,
									height: nodeHeight * zoom,
									transformOrigin: "top left",
									transform: `scale(${zoom})`,
									border: isPlaceholder
										? "1px dashed #bbb"
										: isSelected
										? "2px solid #FFD700"
										: "1px solid #999",
									borderRadius: 6,
									background: isPlaceholder ? "#fff" : "#eef",
									boxSizing: "border-box",
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									justifyContent: "center",
									fontSize: 14,
									cursor:
										onNodeClick && !isPlaceholder
											? "pointer"
											: "default",
									...(isSelected && {
										boxShadow:
											"0 0 10px 2px rgba(255,215,0,0.8)",
									}),
								}}
								onClick={() => {
									// Only allow clicks on real nodes, not placeholders
									if (onNodeClick && !isPlaceholder) {
										onNodeClick(p.node);
									}
								}}
							>
								<div
									style={{
										marginBottom: 4,
										width: 24,
										height: 24,
										background: isPlaceholder
											? "transparent"
											: "#ccc",
										borderRadius: "50%",
										textAlign: "center",
										lineHeight: "24px",
									}}
								>
									{isPlaceholder ? "" : "👤"}
								</div>
								<div
									style={{ fontWeight: 600 }}
									className="text-black"
								>
									{p.node.username}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

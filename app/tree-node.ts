export interface TreeNode {
	distributor_id: number;
	username: string;
	fullName: string;
	status: string;
	product: string;
	category: string;
	num_children: number;
	parent_id: number | null;
	binary_placement: string | null;
	left: TreeNode | null;
	right: TreeNode | null;
	parent: TreeNode | null;
}

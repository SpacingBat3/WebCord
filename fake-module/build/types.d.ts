export interface PipewirePort {
    id: number;
    permissions: number;
    props: string;
    node_id: number;
    name: string;
    direction: string;
}
export interface PipewireNode {
    id: number;
    permissions: number;
    props: string;
    name: string;
    node_direction: string;
    node_type: string;
    ports: PipewirePort[];
}
export interface PipewireLink {
    id: number;
    permissions: number;
    props: string;
    input_node_id: number;
    input_port_id: number;
    output_node_id: number;
    output_port_id: number;
}

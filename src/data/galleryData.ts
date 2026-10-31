import { MasonryItem } from '../components/MasonryGallery';

export interface CampusGalleryItem extends MasonryItem {
  category: 'Laboratories' | 'Research & Computing' | 'Campus Life' | 'Blueprints';
  equipment?: string[];
  location?: string;
}

export const CAMPUS_GALLERY_ITEMS: CampusGalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Advanced AI & Supercomputing Cluster',
    department: 'AI/ML & CSE',
    category: 'Research & Computing',
    height: 440,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    description: 'High-density GPU computing clusters powering deep neural model training, computer vision research, and student autonomous project simulations.',
    equipment: ['NVIDIA Tesla Racks', '100 Gbps InfiniBand', 'Liquid Cooling', 'Jupyter Lab Clusters'],
    location: 'Tech Tower, 4th Floor'
  },
  {
    id: 'gal-2',
    title: 'Central Digital Library & Research Atrium',
    department: 'Academic Hub',
    category: 'Campus Life',
    height: 320,
    img: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop&q=80',
    description: 'Modern reading atriums with IEEE Xplore terminals, silent collaborative pods, and autonomous book lending RFID turnstiles.',
    equipment: ['RFID Self-Checkout', 'IEEE & Springer Terminals', 'Silent Study Pods', 'E-Book Readers'],
    location: 'Knowledge Center, Ground Floor'
  },
  {
    id: 'gal-3',
    title: 'VLSI Circuit Fabrication & Embedded Suite',
    department: 'ECE',
    category: 'Laboratories',
    height: 500,
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    description: 'Silicon hardware design station with mixed-signal oscilloscopes, ARM Cortex-M microcontrollers, FPGA development boards, and PCB milling.',
    equipment: ['Keysight Mixed-Signal Scopes', 'Cadence Virtuoso', 'Xilinx Zynq FPGA', 'SMD Rework Station'],
    location: 'Sir M.V. Block, 2nd Floor'
  },
  {
    id: 'gal-4',
    title: 'Autonomous Robotics & Aerial Drone Arena',
    department: 'Robotics & ISE',
    category: 'Laboratories',
    height: 360,
    img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    description: 'Indoor netted test flight arena for multi-rotor drones, autonomous mobile robots (AMRs), ROS2 telemetry, and LiDAR SLAM mapping.',
    equipment: ['Vicon Motion Capture Cameras', 'Quadcopter Test Cage', 'ROS2 Navigation Stacks', 'LiDAR Sensors'],
    location: 'Innovation Wing, Room 108'
  },
  {
    id: 'gal-5',
    title: 'Civil Structural Dynamics & Shake Table Lab',
    department: 'CIVIL',
    category: 'Laboratories',
    height: 420,
    img: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80',
    description: 'Earthquake ground motion simulation shake tables, 2000 kN universal concrete compression machines, and total station digital surveying kits.',
    equipment: ['Servo-Hydraulic Shake Table', 'Universal Testing Machine', 'Total Station Surveying', 'ETABS Workstations'],
    location: 'Civil Engineering Annex'
  },
  {
    id: 'gal-6',
    title: '5-Axis CNC & Additive 3D Prototyping Unit',
    department: 'MECH',
    category: 'Blueprints',
    height: 350,
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    description: 'Precision robotic subtractive milling, industrial SLA/FDM 3D printing, coordinate measuring machines (CMM), and CAD/CAM automation.',
    equipment: ['5-Axis Machining Center', 'Industrial SLA Printers', 'Mitutoyo CMM', 'SolidWorks CAD Suite'],
    location: 'Mechanical Workshop 2'
  },
  {
    id: 'gal-7',
    title: 'Big Data Analytics & Cloud Telemetry Center',
    department: 'Data Science',
    category: 'Research & Computing',
    height: 460,
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    description: 'Apache Spark streaming clusters, interactive dashboard video walls, and edge computing nodes processing live institutional data streams.',
    equipment: ['Hadoop & Spark Clusters', 'Dual 4K Monitoring Wall', 'AWS & GCP Local Edge Pods', 'Tableau Server'],
    location: 'CS IT Complex, Room 304'
  },
  {
    id: 'gal-8',
    title: 'Annual Hackathon & Innovation Expo Arena',
    department: 'Campus Life',
    category: 'Campus Life',
    height: 330,
    img: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    description: '24-hour national student hackathons, venture pitch rounds, coding marathons, and collaborative prototype exhibition stages.',
    equipment: ['High-Speed Gigabit Wi-Fi 6', 'Dual Projection Stages', 'Prototyping Sandbox', 'Pitch Podium'],
    location: 'Auditorium Quadrangle'
  },
  {
    id: 'gal-9',
    title: 'Satellite Telemetry & Antenna Ground Station',
    department: 'ECE & Space Tech',
    category: 'Research & Computing',
    height: 400,
    img: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=800&auto=format&fit=crop&q=80',
    description: 'Rooftop tracking dish decoding CubeSat downlinks, weather satellite imagery, and software-defined radio (SDR) signal processing.',
    equipment: ['Az-El Rotor Antenna Array', 'HackRF SDR Tranceivers', 'Spectrum Analyzers', 'NOAA Weather Decoders'],
    location: 'Main Block Rooftop Observatory'
  },
  {
    id: 'gal-10',
    title: 'Clean Energy & Smart Microgrid Research Station',
    department: 'CIVIL & EEE',
    category: 'Blueprints',
    height: 370,
    img: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=80',
    description: 'Campus solar microgrid telemetry, battery storage inverters, ecological monitoring sensors, and rainwater harvesting testbeds.',
    equipment: ['100kW Solar Inverter Bank', 'Battery Management System', 'Weather Telemetry Station', 'Hydrology Sensors'],
    location: 'Eco-Park Innovation Zone'
  }
];

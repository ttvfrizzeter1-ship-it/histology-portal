import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const ORGANELLES = {
  nucleus: {
    name: 'Ядро',
    fact: 'Керує активністю клітини та містить генетичний матеріал.',
    color: '#facc15',
  },
  dna: {
    name: 'ДНК',
    fact: 'Несе спадкову інформацію й керує синтезом білків.',
    color: '#f59e0b',
  },
  mitochondria: {
    name: 'Мітохондрія',
    fact: 'Виробляє енергію (ATP) для клітинних процесів.',
    color: '#fb923c',
  },
  golgi: {
    name: 'Комплекс Гольджі',
    fact: 'Модифікує, сортує та пакує білки у везикули.',
    color: '#38bdf8',
  },
  rough_er: {
    name: 'Шорстка ЕПС',
    fact: 'Синтезує білки за участю рибосом на поверхні.',
    color: '#60a5fa',
  },
  smooth_er: {
    name: 'Гладка ЕПС',
    fact: 'Бере участь у синтезі ліпідів та детоксикації.',
    color: '#a78bfa',
  },
  centrosome: {
    name: 'Центросома',
    fact: 'Організовує мікротрубочки під час поділу клітини.',
    color: '#f97316',
  },
  lysosome: {
    name: 'Лізосома / везикула',
    fact: 'Забезпечує перетравлення та утилізацію речовин у клітині.',
    color: '#ef4444',
  },
  membrane: {
    name: 'Клітинна мембрана',
    fact: 'Відокремлює клітину від середовища та регулює транспорт.',
    color: '#22c55e',
  },
};

const findOrganelleId = (nodeName) => {
  const n = (nodeName || '').toLowerCase();
  if (!n) return null;
  if (n.includes('core')) return 'nucleus';
  if (n.includes('dna')) return 'dna';
  if (n.includes('mitoh')) return 'mitochondria';
  if (n.includes('goj')) return 'golgi';
  if (n.includes('retic')) return 'rough_er';
  if (n.includes('smooth re')) return 'smooth_er';
  if (n.includes('centros')) return 'centrosome';
  if (n.includes('lyb') || n.includes('icosphere')) return 'lysosome';
  if (n.includes('base') || n.includes('vors')) return 'membrane';
  return null;
};

function CellModel({ selected, onSelect }) {
  const groupRef = useRef(null);
  const { scene } = useGLTF('/models/human_cell/scene.gltf');
  const model = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z);
    const scale = maxAxis > 0 ? 3.0 / maxAxis : 1;
    model.scale.setScalar(scale);

    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y -= 0.18;

    model.traverse((obj) => {
      const orgFromNode = findOrganelleId(obj.name);
      if (orgFromNode) obj.userData.organelleId = orgFromNode;

      if (obj.isMesh) {
        obj.castShadow = false;
        obj.receiveShadow = false;
        obj.material = obj.material.clone();
        obj.userData.baseEmissiveIntensity = obj.material.emissiveIntensity || 0;
        obj.userData.baseEmissive = obj.material.emissive ? obj.material.emissive.clone() : new THREE.Color('#000000');

        let p = obj.parent;
        while (p && !obj.userData.organelleId) {
          if (p.userData.organelleId) obj.userData.organelleId = p.userData.organelleId;
          p = p.parent;
        }
      }
    });
  }, [model]);

  useEffect(() => {
    model.traverse((obj) => {
      if (!obj.isMesh) return;
      const isSelected = selected && obj.userData.organelleId === selected;
      if (!obj.material?.emissive) return;
      obj.material.emissive.copy(obj.userData.baseEmissive);
      obj.material.emissiveIntensity = obj.userData.baseEmissiveIntensity;
      if (isSelected) {
        obj.material.emissive = new THREE.Color(ORGANELLES[selected]?.color || '#facc15');
        obj.material.emissiveIntensity = 0.38;
      }
    });
  }, [model, selected]);

  return (
    <group
      ref={groupRef}
      onPointerDown={(e) => {
        e.stopPropagation();
        const id = e.object?.userData?.organelleId;
        if (id) onSelect(id);
      }}
      onPointerOver={(e) => {
        const id = e.object?.userData?.organelleId;
        if (id) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload('/models/human_cell/scene.gltf');

export default function HumanCell3D() {
  const [selected, setSelected] = useState('nucleus');

  return (
    <div className="relative w-[min(94vw,680px)] h-[min(76vw,520px)] rounded-2xl border border-white/10 bg-transparent shadow-[0_20px_55px_rgba(0,0,0,0.28)] overflow-hidden">
      <Canvas
        camera={{ position: [0, 5.8, 0.001], fov: 24 }}
        dpr={[0.8, 1.2]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 5]} intensity={1.05} />
        <directionalLight position={[-4, 2, -5]} intensity={0.35} />
        <Suspense fallback={null}>
          <CellModel selected={selected} onSelect={setSelected} />
        </Suspense>
        <OrbitControls
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.09}
          enableRotate={false}
          enablePan={false}
          minDistance={4.4}
          maxDistance={7.2}
          minPolarAngle={0}
          maxPolarAngle={0}
        />
      </Canvas>

      <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-yellow-300/30 bg-gradient-to-r from-[#1b1023]/78 via-[#1f1120]/72 to-[#1a1628]/76 backdrop-blur-md px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.32)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
          <div className="text-yellow-200 text-[15px] font-bold tracking-wide">{ORGANELLES[selected]?.name}</div>
        </div>
        <div className="text-gray-100/95 text-[15px] leading-snug">
          {ORGANELLES[selected]?.fact}
        </div>
      </div>
    </div>
  );
}

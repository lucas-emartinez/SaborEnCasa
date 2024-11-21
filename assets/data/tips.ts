export const tipsData = [
    {
      id: '1',
      title: 'Porciones saludables',
      description: 'Utiliza el tamaño de tu puño como referencia para las porciones de carbohidratos',
      iconName: 'box',
      mainImage: require('@/assets/images/portion-control.jpg'),
      fullContent: [
        {
          type: 'paragraph',
          content: 'Controlar el tamaño de las porciones es fundamental para mantener una alimentación equilibrada. Usar tu propio puño como referencia es una forma práctica de medir las porciones sin necesidad de báscula.',
        },
        {
          type: 'image',
          source: require('@/assets/images/hand-portions.jpg'),
          caption: 'Guía visual de medidas usando la mano',
        },
        {
          type: 'subtitle',
          content: '¿Por qué es importante?',
        },
        {
          type: 'paragraph',
          content: 'El control de porciones es uno de los aspectos más importantes de una alimentación saludable. No solo se trata de qué comemos, sino también de cuánto comemos. Un desbalance en el tamaño de las porciones puede llevar a una ingesta excesiva de calorías o a deficiencias nutricionales.',
        },
        {
          type: 'bullets',
          content: [
            'Mantener un peso saludable y estable a largo plazo',
            'Mejorar la digestión y absorción de nutrientes',
            'Evitar el desperdicio de alimentos y ahorrar dinero',
            'Mantener niveles estables de energía durante el día',
            'Mejorar la relación con la comida',
          ],
        },
        {
          type: 'tips',
          content: [
            {
              title: 'Usa platos más pequeños',
              description: 'Los platos de 23-25 cm son ideales para controlar porciones.',
            },
            {
              title: 'Come sin distracciones',
              description: 'Evita comer frente al televisor o el celular.',
            },
            {
              title: 'Sirve una vez',
              description: 'Evita servir segundas porciones automáticamente.',
            },
          ],
        },
        {
          type: 'quote',
          content: 'La clave no es la perfección, sino la consistencia en mantener porciones adecuadas la mayoría del tiempo.',
          author: 'Dra. María González, Nutricionista',
        },
      ],
      relatedTips: ['2', '3', '4'],
    },
    {
      id: '2',
      title: 'Hidratación correcta',
      description: 'Bebe agua 30 minutos antes de cada comida para mejorar la digestión',
      iconName: 'droplet',
      mainImage: require('@/assets/images/hydration.jpg'),
      fullContent: [
        {
          type: 'paragraph',
          content: 'La hidratación adecuada es esencial para el funcionamiento óptimo de nuestro cuerpo. Beber agua en los momentos correctos puede maximizar sus beneficios para la salud y la digestión.',
        },
        {
          type: 'subtitle',
          content: 'Beneficios de una buena hidratación',
        },
        {
          type: 'bullets',
          content: [
            'Mejora el metabolismo y la digestión',
            'Ayuda a mantener la temperatura corporal',
            'Facilita la eliminación de toxinas',
            'Mejora la concentración y el estado de ánimo',
            'Contribuye a una piel más saludable',
          ],
        },
        {
          type: 'image',
          source: require('@/assets/images/water-timing.jpg'),
          caption: 'Momentos clave para la hidratación durante el día',
        },
        {
          type: 'subtitle',
          content: 'Momentos óptimos para beber agua',
        },
        {
          type: 'tips',
          content: [
            {
              title: 'Al despertar',
              description: 'Un vaso de agua ayuda a activar los órganos internos.',
            },
            {
              title: 'Antes de las comidas',
              description: '30 minutos antes mejora la digestión.',
            },
            {
              title: 'Durante el ejercicio',
              description: 'Pequeños sorbos cada 15-20 minutos.',
            },
          ],
        },
        {
          type: 'quote',
          content: 'La hidratación no es solo beber agua, es hacerlo en el momento adecuado para maximizar sus beneficios.',
          author: 'Dr. Carlos Ruiz, Especialista en Nutrición Deportiva',
        },
      ],
      relatedTips: ['1', '3', '4'],
    },
    {
      id: '3',
      title: 'Proteínas vegetales',
      description: 'Incluye legumbres en tus comidas como alternativa saludable a la proteína animal',
      iconName: 'feather',
      mainImage: require('@/assets/images/plant-protein.jpg'),
      fullContent: [
        {
          type: 'paragraph',
          content: 'Las proteínas vegetales son una excelente alternativa a las proteínas animales, ofreciendo beneficios adicionales como fibra y antioxidantes. Incorporarlas en tu dieta puede mejorar tu salud y reducir tu huella ambiental.',
        },
        {
          type: 'subtitle',
          content: 'Fuentes de proteína vegetal',
        },
        {
          type: 'bullets',
          content: [
            'Legumbres: lentejas, garbanzos, frijoles',
            'Semillas: chía, quinoa, amaranto',
            'Frutos secos: almendras, nueces, pistachos',
            'Soja y sus derivados: tofu, tempeh, edamame',
            'Cereales integrales: avena, trigo sarraceno',
          ],
        },
        {
          type: 'image',
          source: require('@/assets/images/legumes.jpeg'),
          caption: 'Variedad de legumbres ricas en proteínas',
        },
        {
          type: 'tips',
          content: [
            {
              title: 'Combinación perfecta',
              description: 'Combina legumbres con cereales para proteínas completas.',
            },
            {
              title: 'Preparación correcta',
              description: 'Remoja las legumbres para mejorar su digestión.',
            },
            {
              title: 'Incorporación gradual',
              description: 'Comienza con pequeñas porciones para adaptar tu digestión.',
            },
          ],
        },
        {
          type: 'quote',
          content: 'Las proteínas vegetales no solo alimentan nuestro cuerpo, sino también nuestra conciencia ambiental.',
          author: 'Dra. Ana Martínez, Nutricionista Vegetariana',
        },
      ],
      relatedTips: ['1', '2', '4'],
    },
    {
      id: '4',
      title: 'Come despacio',
      description: 'Mastica cada bocado al menos 20 veces para una mejor digestión',
      iconName: 'clock',
      mainImage: require('@/assets/images/mindful-eating.jpg'),
      fullContent: [
        {
          type: 'paragraph',
          content: 'Comer despacio no es solo un hábito saludable, es una forma de mejorar tu relación con la comida y optimizar tu digestión. Tu cerebro necesita aproximadamente 20 minutos para registrar la sensación de saciedad.',
        },
        {
          type: 'subtitle',
          content: 'Beneficios de comer despacio',
        },
        {
          type: 'bullets',
          content: [
            'Mejor digestión y absorción de nutrientes',
            'Control natural del apetito',
            'Reducción del estrés durante las comidas',
            'Mayor disfrute de los sabores',
            'Prevención de problemas digestivos',
          ],
        },
        {
          type: 'image',
          source: require('@/assets/images/mindful-eating-practice.webp'),
          caption: 'Práctica de alimentación consciente',
        },
        {
          type: 'subtitle',
          content: 'Técnicas para comer más despacio',
        },
        {
          type: 'tips',
          content: [
            {
              title: 'Cuenta las masticadas',
              description: 'Intenta masticar cada bocado al menos 20 veces.',
            },
            {
              title: 'Usa los cubiertos',
              description: 'Déjalos en la mesa entre bocados.',
            },
            {
              title: 'Programa tus comidas',
              description: 'Dedica al menos 20 minutos a cada comida principal.',
            },
          ],
        },
        {
          type: 'quote',
          content: 'El arte de comer despacio es una inversión en tu salud digestiva y tu bienestar general.',
          author: 'Dr. Miguel Ángel Sánchez, Especialista en Nutrición',
        },
      ],
      relatedTips: ['1', '2', '3'],
    },
  ];
const fs = require('fs');

const serverContent = fs.readFileSync('server.js', 'utf8');

// Находим и заменяем DELETE managers
const fixed = serverContent.replace(
  /app\.delete\('\/managers\/:id',[\s\S]*?res\.json\({ success: true }\);[\s\S]*?\}\);/,
  `app.delete('/managers/:id', (req, res) => {
  const { id } = req.params;
  // Сначала удаляем связи с пиццериями
  db.prepare('DELETE FROM pizzeria_managers WHERE manager_id = ?').run(id);
  // Потом удаляем пользователя
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true });
});`
);

fs.writeFileSync('server.js', fixed);
console.log('✅ Fixed DELETE managers!');

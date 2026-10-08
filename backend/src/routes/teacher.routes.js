const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { enforceTenant } = require('../middlewares/tenant.middleware');

router.use(authenticate);
router.use(enforceTenant);

router.get('/', teacherController.getTeachers);
router.get('/:id', teacherController.getTeacherById);
router.post('/', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), teacherController.createTeacher);
router.put('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']), teacherController.updateTeacher);
router.delete('/:id', requireRole(['SUPER_ADMIN', 'SCHOOL_ADMIN']), teacherController.deleteTeacher);

module.exports = router;

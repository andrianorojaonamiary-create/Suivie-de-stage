import { useMemo, useState } from 'react';
import { FaTimes, FaUserEdit, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

import SelectPersonnalise from '../../../components/Common/SelectPersonnalise';
import { getApiErrorMessage } from '../../../api/apiClient';
import { teacherAssignmentsApi } from '../../../api';

function TuteurEditModal({ assignment, options, onClose, onSaved }) {
  const [teacherId, setTeacherId] = useState(assignment?.teacher?.id ?? '');
  const [submitting, setSubmitting] = useState(false);

  const teacherOptions = useMemo(
    () =>
      (options?.teachers ?? []).map((t) => ({
        value: t.id,
        label:
          `${t.nom} ${t.prenom} — ${t.assignmentCount ?? 0} étudiant(s)`.trim(),
      })),
    [options?.teachers],
  );

  const sameTeacher = teacherId === (assignment?.teacher?.id ?? '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      toast.error('Sélectionnez un enseignant.');
      return;
    }
    if (sameTeacher) {
      toast.error('Cet étudiant est déjà suivi par cet enseignant.');
      return;
    }
    setSubmitting(true);
    try {
      await teacherAssignmentsApi.update(assignment.id, { teacherId });
      toast.success('Enseignant mis à jour.');
      onSaved();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'La modification a échoué.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay admin-affectation-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <FaUserEdit /> Modifier l'encadreur
          </h3>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="admin-affectation-warning">
              <FaInfoCircle />
              Encadré actuellement :{' '}
              {[assignment?.teacher?.prenom, assignment?.teacher?.nom]
                .filter(Boolean)
                .join(' ') || '—'}
            </div>

            <div className="form-group">
              <label>Nouvel encadreur pour {assignment?.student?.prenom} {assignment?.student?.nom}</label>
              <SelectPersonnalise
                value={teacherId}
                onChange={setTeacherId}
                placeholder="Sélectionner un enseignant"
                className="form-control"
                options={teacherOptions}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={submitting || sameTeacher}>
              {submitting ? 'Mise à jour...' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TuteurEditModal;

package org.example.pagamentos.repository;

import org.example.pagamentos.model.DescontoItemModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DescontoItemRepository extends JpaRepository<DescontoItemModel, Long> {
    List<DescontoItemModel> findByItemIdItem(Long itemId);
}
